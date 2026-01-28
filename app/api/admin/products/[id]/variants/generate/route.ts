import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await requireSession();
        requireRole(session.user.role, ["ADMIN", "SELLER"]);

        // If SELLER, check ownership
        if (session.user.role === "SELLER") {
            const product = await prisma.product.findUnique({ where: { id: params.id } });
            if (!product || product.sellerId !== session.user.id) {
                return NextResponse.json({ error: { message: "Access denied" } }, { status: 403 });
            }
        }

        const options = await prisma.productOption.findMany({
            where: { productId: params.id },
            orderBy: { position: "asc" }
        });

        if (options.length === 0) {
            return NextResponse.json({ error: { message: "No options defined" } }, { status: 400 });
        }

        // Cartesian product helper
        const cartesian = (...args: any[][]) => args.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

        const optionValues = options.map(o => o.values);
        const combinations = options.length > 1 ? cartesian(...optionValues) : optionValues[0].map(v => [v]);

        const existingVariants = await prisma.productVariant.findMany({
            where: { productId: params.id }
        });

        const newVariantsData: any[] = [];

        combinations.forEach((combo: string[]) => {
            const attributes: Record<string, string> = {};
            options.forEach((opt, idx) => {
                attributes[opt.name] = combo[idx];
            });

            const title = combo.join(" / ");

            // Check if exists
            const exists = existingVariants.find(v => v.title === title);
            if (!exists) {
                newVariantsData.push({
                    productId: params.id,
                    title,
                    attributesJson: attributes,
                    stockQty: 0
                });
            }
        });

        if (newVariantsData.length > 0) {
            await prisma.productVariant.createMany({
                data: newVariantsData
            });
        }

        return NextResponse.json({
            success: true,
            generatedCount: newVariantsData.length
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: { message: error.message } }, { status: error.status });
        }
        console.error("Variant Generation error:", error);
        return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
    }
}
