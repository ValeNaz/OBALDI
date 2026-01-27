import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";

const validateSchema = z.object({
    code: z.string().min(3).max(30),
    orderTotalCents: z.number().int().positive()
});

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
    const parsed = validateSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: { code: "INVALID_INPUT", message: "Invalid request." } },
            { status: 400 }
        );
    }

    const coupon = await prisma.coupon.findUnique({
        where: { code: parsed.data.code.toUpperCase() }
    });

    if (!coupon) {
        return NextResponse.json(
            { error: { code: "INVALID_CODE", message: "Codice coupon non valido." } },
            { status: 404 }
        );
    }

    // Check if active
    if (!coupon.isActive) {
        return NextResponse.json(
            { error: { code: "INACTIVE", message: "Questo coupon non è più attivo." } },
            { status: 400 }
        );
    }

    // Check validity period
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
        return NextResponse.json(
            { error: { code: "NOT_YET_VALID", message: "Questo coupon non è ancora valido." } },
            { status: 400 }
        );
    }
    if (coupon.validUntil && now > coupon.validUntil) {
        return NextResponse.json(
            { error: { code: "EXPIRED", message: "Questo coupon è scaduto." } },
            { status: 400 }
        );
    }

    // Check max uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json(
            { error: { code: "MAX_USES_REACHED", message: "Questo coupon ha raggiunto il limite di utilizzi." } },
            { status: 400 }
        );
    }

    // Check minimum order
    if (coupon.minOrderCents && parsed.data.orderTotalCents < coupon.minOrderCents) {
        return NextResponse.json(
            {
                error: {
                    code: "MIN_ORDER_NOT_MET",
                    message: `Ordine minimo di €${(coupon.minOrderCents / 100).toFixed(2)} richiesto.`
                }
            },
            { status: 400 }
        );
    }

    // Calculate discount
    let discountCents: number;

    if (coupon.type === "PERCENTAGE") {
        // value is percentage * 100 (e.g., 1000 = 10%)
        discountCents = Math.floor(parsed.data.orderTotalCents * coupon.value / 10000);
    } else {
        // FIXED_AMOUNT - value is in cents
        discountCents = coupon.value;
    }

    // Apply max discount cap if set
    if (coupon.maxDiscountCents && discountCents > coupon.maxDiscountCents) {
        discountCents = coupon.maxDiscountCents;
    }

    // Don't let discount exceed order total
    if (discountCents > parsed.data.orderTotalCents) {
        discountCents = parsed.data.orderTotalCents;
    }

    return NextResponse.json({
        valid: true,
        coupon: {
            id: coupon.id,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value
        },
        discountCents,
        discountFormatted: `€${(discountCents / 100).toFixed(2)}`,
        newTotalCents: parsed.data.orderTotalCents - discountCents
    });
}
