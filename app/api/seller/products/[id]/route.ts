import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

type Params = {
    params: {
        id: string;
    };
};

// Middleware-like check for ownership
async function checkOwnership(userId: string, productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return null;
    if (product.sellerId !== userId) return null;
    return product;
}

export async function GET(request: Request, { params }: Params) {
    try {
        const session = await requireSession();
        requireRole(session.user.role, ["SELLER", "ADMIN"]);

        const product = await checkOwnership(session.user.id, params.id);
        if (!product) {
            return NextResponse.json(
                { error: { code: "NOT_FOUND", message: "Product not found or access denied" } },
                { status: 404 }
            );
        }

        // Include media
        const productWithMedia = await prisma.product.findUnique({
            where: { id: params.id },
            include: { media: { orderBy: { sortOrder: "asc" } } }
        });

        return NextResponse.json({ product: productWithMedia });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json(
                { error: { code: error.code, message: error.message } },
                { status: error.status }
            );
        }
        return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: Params) {
    try {
        const session = await requireSession();
        requireRole(session.user.role, ["SELLER", "ADMIN"]);

        const existing = await checkOwnership(session.user.id, params.id);
        if (!existing) {
            return NextResponse.json(
                { error: { code: "NOT_FOUND", message: "Product not found or access denied" } },
                { status: 404 }
            );
        }

        const body = await request.json();

        // Safety check: if modifying critical fields of an APPROVED product, we might want to revert to PENDING or DRAFT?
        // For MVP "manage in any way", we let them edit. But ideally we should prevent editing 'price' without review?
        // User requested "fai in modo che il venditore abbia un pannellino simile... gestione dei propri prodotti".
        // I will allow full edit.

        const product = await prisma.product.update({
            where: { id: params.id },
            data: {
                title: body.title,
                description: body.description,
                priceCents: body.priceCents,
                currency: body.currency,
                premiumOnly: body.premiumOnly,
                pointsEligible: body.pointsEligible,
                pointsPrice: body.pointsEligible ? body.pointsPrice : null,
                specsJson: body.specsJson,
                category: body.category as any,
            },
            include: { media: true }
        });

        await prisma.auditLog.create({
            data: {
                actorUserId: session.user.id,
                action: "product.updated",
                entity: "product",
                entityId: product.id,
                metadataJson: body
            }
        });

        return NextResponse.json({ product });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json(
                { error: { code: error.code, message: error.message } },
                { status: error.status }
            );
        }
        return NextResponse.json({ error: { message: "Failed to update product" } }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: Params) {
    try {
        const session = await requireSession();
        requireRole(session.user.role, ["SELLER", "ADMIN"]);

        const existing = await checkOwnership(session.user.id, params.id);
        if (!existing) {
            return NextResponse.json(
                { error: { code: "NOT_FOUND", message: "Product not found or access denied" } },
                { status: 404 }
            );
        }

        // Check orders (prevent deletion if sold?)
        const ordered = await prisma.orderItem.findFirst({ where: { productId: params.id } });
        if (ordered) {
            return NextResponse.json({ error: { message: "Cannot delete ordered product. Contact support to archive." } }, { status: 400 });
        }

        await prisma.productMedia.deleteMany({ where: { productId: params.id } });

        await prisma.product.delete({
            where: { id: params.id }
        });

        await prisma.auditLog.create({
            data: {
                actorUserId: session.user.id,
                action: "product.deleted",
                entity: "product",
                entityId: params.id,
                metadataJson: {}
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json(
                { error: { code: error.code, message: error.message } },
                { status: error.status }
            );
        }
        return NextResponse.json({ error: { message: "Failed to delete product" } }, { status: 500 });
    }
}
