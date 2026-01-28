import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await requireSession();
        requireRole(session.user.role, ["SELLER"]);

        // Check ownership
        const product = await prisma.product.findUnique({ where: { id: params.id } });
        if (!product || product.sellerId !== session.user.id) {
            return NextResponse.json({ error: { message: "Access denied" } }, { status: 403 });
        }

        const options = await prisma.productOption.findMany({
            where: { productId: params.id },
            orderBy: { position: "asc" }
        });

        if (options.length === 0) {
            // If no options, maybe clear variants? Or just do nothing?
            // Usually we delete all variants if no options.
            await prisma.productVariant.deleteMany({ where: { productId: params.id } });
            return NextResponse.json({ success: true, count: 0 });
        }

        // Generate combinations (Cartesian product)
        const generateCombinations = (opts: any[], index = 0, current: any = {}): any[] => {
            if (index === opts.length) return [current];
            const opt = opts[index];
            const result = [];
            for (const val of opt.values) {
                result.push(...generateCombinations(opts, index + 1, { ...current, [opt.name]: val }));
            }
            return result;
        };

        const combinations = generateCombinations(options);

        // Delete existing variants (simple approach) or update?
        // Simple approach: Delete all and recreate.
        // Better approach for production: Upsert or keep existing IDs if possible.
        // For MVP, we'll delete all because logic is identical to Admin's likely simple implementation.

        await prisma.productVariant.deleteMany({ where: { productId: params.id } });

        await prisma.productVariant.createMany({
            data: combinations.map(c => ({
                productId: params.id,
                title: Object.values(c).join(" / "),
                attributesJson: c,
                priceCents: product.priceCents, // Default to product price
                stockQty: 0
            }))
        });

        return NextResponse.json({ success: true, count: combinations.length });

    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: { message: error.message } }, { status: error.status });
        }
        return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
    }
}
