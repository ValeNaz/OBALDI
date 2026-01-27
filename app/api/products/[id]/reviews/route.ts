import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";

const reviewSchema = z.object({
    orderId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    title: z.string().max(100).optional(),
    body: z.string().max(2000).optional()
});

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: productId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = 10;

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: { firstName: true, lastName: true, avatarUrl: true }
                }
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit
        }),
        prisma.review.count({ where: { productId } })
    ]);

    // Calculate average rating
    const stats = await prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true }
    });

    return NextResponse.json({
        reviews: reviews.map(r => ({
            id: r.id,
            rating: r.rating,
            title: r.title,
            body: r.body,
            isVerified: r.isVerified,
            createdAt: r.createdAt,
            user: {
                name: [r.user.firstName, r.user.lastName].filter(Boolean).join(" ") || "Utente",
                avatarUrl: r.user.avatarUrl
            }
        })),
        stats: {
            averageRating: stats._avg.rating ?? 0,
            totalReviews: stats._count.rating
        },
        pagination: {
            page,
            limit,
            total,
            hasMore: page * limit < total
        }
    });
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: productId } = await params;

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
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: { code: "INVALID_INPUT", message: "Invalid review data.", details: parsed.error.flatten() } },
            { status: 400 }
        );
    }

    // Check product exists and is approved
    const product = await prisma.product.findUnique({
        where: { id: productId, status: "APPROVED" }
    });

    if (!product) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "Product not found." } },
            { status: 404 }
        );
    }

    // Check user has purchased this product in the specified order
    const orderWithProduct = await prisma.order.findFirst({
        where: {
            id: parsed.data.orderId,
            userId: session.user.id,
            status: "PAID",
            items: {
                some: { productId }
            }
        }
    });

    if (!orderWithProduct) {
        return NextResponse.json(
            { error: { code: "NOT_PURCHASED", message: "You must purchase this product to leave a review." } },
            { status: 403 }
        );
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findUnique({
        where: {
            userId_productId: {
                userId: session.user.id,
                productId
            }
        }
    });

    if (existingReview) {
        return NextResponse.json(
            { error: { code: "ALREADY_REVIEWED", message: "You have already reviewed this product." } },
            { status: 409 }
        );
    }

    const review = await prisma.review.create({
        data: {
            productId,
            userId: session.user.id,
            orderId: parsed.data.orderId,
            rating: parsed.data.rating,
            title: parsed.data.title,
            body: parsed.data.body,
            isVerified: true
        }
    });

    return NextResponse.json({ review }, { status: 201 });
}
