import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";

const addSchema = z.object({
    productId: z.string().uuid()
});

export async function GET() {
    let session;
    try {
        session = await requireSession();
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json(
                { error: { code: error.code, message: error.message } },
                { status: error.status }
            );
        }
        throw error;
    }

    const items = await prisma.wishlistItem.findMany({
        where: { userId: session.user.id },
        include: {
            product: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    priceCents: true,
                    currency: true,
                    isOutOfStock: true,
                    premiumOnly: true,
                    media: {
                        where: { type: "IMAGE" },
                        take: 1,
                        orderBy: { sortOrder: "asc" },
                        select: { url: true }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
        items: items.map(item => ({
            id: item.id,
            productId: item.productId,
            addedAt: item.createdAt,
            product: {
                ...item.product,
                image: item.product.media[0]?.url ?? null
            }
        }))
    });
}

export async function POST(request: Request) {
    let session;
    try {
        session = await requireSession();
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json(
                { error: { code: error.code, message: error.message } },
                { status: error.status }
            );
        }
        throw error;
    }

    const body = await request.json().catch(() => null);
    const parsed = addSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: { code: "INVALID_INPUT", message: "Invalid product ID." } },
            { status: 400 }
        );
    }

    // Check product exists
    const product = await prisma.product.findUnique({
        where: { id: parsed.data.productId, status: "APPROVED" }
    });

    if (!product) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "Product not found." } },
            { status: 404 }
        );
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
        where: {
            userId_productId: {
                userId: session.user.id,
                productId: parsed.data.productId
            }
        }
    });

    if (existing) {
        return NextResponse.json(
            { error: { code: "ALREADY_EXISTS", message: "Already in wishlist." } },
            { status: 409 }
        );
    }

    const item = await prisma.wishlistItem.create({
        data: {
            userId: session.user.id,
            productId: parsed.data.productId
        }
    });

    return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(request: Request) {
    let session;
    try {
        session = await requireSession();
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json(
                { error: { code: error.code, message: error.message } },
                { status: error.status }
            );
        }
        throw error;
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
        return NextResponse.json(
            { error: { code: "INVALID_INPUT", message: "Product ID required." } },
            { status: 400 }
        );
    }

    await prisma.wishlistItem.deleteMany({
        where: {
            userId: session.user.id,
            productId
        }
    });

    return NextResponse.json({ success: true });
}
