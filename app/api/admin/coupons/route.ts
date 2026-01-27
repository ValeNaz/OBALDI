import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";

const couponSchema = z.object({
    code: z.string().min(3).max(30).toUpperCase(),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    value: z.number().int().positive(),
    minOrderCents: z.number().int().positive().optional(),
    maxDiscountCents: z.number().int().positive().optional(),
    maxUses: z.number().int().positive().optional(),
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().optional(),
    isActive: z.boolean().default(true)
});

export async function GET(request: Request) {
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

    if (session.user.role !== "ADMIN") {
        return NextResponse.json(
            { error: { code: "FORBIDDEN", message: "Admin access required." } },
            { status: 403 }
        );
    }

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");

    const coupons = await prisma.coupon.findMany({
        where: active === "true" ? { isActive: true } : undefined,
        orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ coupons });
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

    if (session.user.role !== "ADMIN") {
        return NextResponse.json(
            { error: { code: "FORBIDDEN", message: "Admin access required." } },
            { status: 403 }
        );
    }

    const body = await request.json().catch(() => null);
    const parsed = couponSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: { code: "INVALID_INPUT", message: "Invalid coupon data.", details: parsed.error.flatten() } },
            { status: 400 }
        );
    }

    // Check for duplicate code
    const existing = await prisma.coupon.findUnique({
        where: { code: parsed.data.code }
    });

    if (existing) {
        return NextResponse.json(
            { error: { code: "DUPLICATE_CODE", message: "Coupon code already exists." } },
            { status: 409 }
        );
    }

    const coupon = await prisma.coupon.create({
        data: {
            ...parsed.data,
            validFrom: parsed.data.validFrom ? new Date(parsed.data.validFrom) : null,
            validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null
        }
    });

    return NextResponse.json({ coupon }, { status: 201 });
}
