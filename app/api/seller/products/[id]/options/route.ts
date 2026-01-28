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

        const body = await request.json();
        const options = body.options; // Array of { name, values, position }

        // Use transaction to update options
        await prisma.$transaction([
            // Clear existing options
            prisma.productOption.deleteMany({ where: { productId: params.id } }),
            // Create new ones
            prisma.productOption.createMany({
                data: options.map((opt: any, idx: number) => ({
                    productId: params.id,
                    name: opt.name,
                    values: opt.values,
                    position: idx
                }))
            })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: { message: error.message } }, { status: error.status });
        }
        return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
    }
}
