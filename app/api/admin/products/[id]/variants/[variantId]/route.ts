import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

type Params = {
    params: {
        id: string; // Product ID
        variantId: string;
    };
};

export async function PATCH(request: Request, { params }: Params) {
    try {
        const session = await requireSession();
        requireRole(session.user.role, ["ADMIN", "SELLER"]);

        // If SELLER, check ownership of the parent product
        if (session.user.role === "SELLER") {
            const product = await prisma.product.findUnique({ where: { id: params.id } });
            if (!product || product.sellerId !== session.user.id) {
                return NextResponse.json({ error: { message: "Access denied" } }, { status: 403 });
            }
        }

        const body = await request.json();
        const variant = await prisma.productVariant.update({
            where: { id: params.variantId, productId: params.id },
            data: {
                sku: body.sku,
                priceCents: body.priceCents,
                stockQty: body.stockQty,
            }
        });

        return NextResponse.json({ variant });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: { message: error.message } }, { status: error.status });
        }
        return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: Params) {
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

        // Check if variant has associated order items
        const ordered = await prisma.orderItem.findFirst({ where: { variantId: params.variantId } });
        if (ordered) {
            return NextResponse.json({ error: { message: "Cannot delete variant with existing orders." } }, { status: 400 });
        }

        await prisma.productVariant.delete({
            where: { id: params.variantId, productId: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: { message: error.message } }, { status: error.status });
        }
        return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
    }
}
