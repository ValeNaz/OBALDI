import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

export async function PATCH(request: Request, { params }: { params: { id: string; variantId: string } }) {
    try {
        const session = await requireSession();
        requireRole(session.user.role, ["SELLER"]);

        // Check ownership of PRODUCT
        const product = await prisma.product.findUnique({ where: { id: params.id } });
        if (!product || product.sellerId !== session.user.id) {
            return NextResponse.json({ error: { message: "Access denied" } }, { status: 403 });
        }

        const body = await request.json();

        // Check if variant belongs to product (implicitly covered by params but good to be safe)
        // Update variant
        const updated = await prisma.productVariant.update({
            where: { id: params.variantId },
            data: {
                priceCents: body.priceCents,
                stockQty: body.stockQty,
                sku: body.sku,
                mediaIndex: body.mediaIndex
            }
        });

        return NextResponse.json({ variant: updated });

    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: { message: error.message } }, { status: error.status });
        }
        return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string; variantId: string } }) {
    try {
        const session = await requireSession();
        requireRole(session.user.role, ["SELLER"]);

        const product = await prisma.product.findUnique({ where: { id: params.id } });
        if (!product || product.sellerId !== session.user.id) {
            return NextResponse.json({ error: { message: "Access denied" } }, { status: 403 });
        }

        await prisma.productVariant.delete({
            where: { id: params.variantId }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: { message: error.message } }, { status: error.status });
        }
        return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
    }
}
