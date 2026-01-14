import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";
import { requireActiveMembership } from "@/src/core/membership/guard";
import { getPointsBalance } from "@/src/core/points/balance";

const schema = z.object({
  productId: z.string().uuid(),
  qty: z.number().int().min(1).max(10)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "Invalid request payload." } },
      { status: 400 }
    );
  }

  let session;
  let membership;
  try {
    session = await requireSession();
    membership = await requireActiveMembership(session.user.id);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    throw error;
  }

  if (membership.plan.pointsPolicyType === "NONE") {
    return NextResponse.json(
      { error: { code: "POINTS_NOT_ALLOWED", message: "Points not allowed." } },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId }
  });

  if (!product || product.status !== "APPROVED") {
    return NextResponse.json(
      { error: { code: "PRODUCT_NOT_AVAILABLE", message: "Product not available." } },
      { status: 404 }
    );
  }

  if (product.isOutOfStock) {
    return NextResponse.json(
      { error: { code: "OUT_OF_STOCK", message: "Product out of stock." } },
      { status: 400 }
    );
  }

  if (!product.pointsEligible || !product.pointsPrice) {
    return NextResponse.json(
      { error: { code: "POINTS_NOT_ELIGIBLE", message: "Points not eligible." } },
      { status: 400 }
    );
  }

  const requiredPoints = product.pointsPrice * parsed.data.qty;
  const balance = await getPointsBalance(session.user.id);

  if (balance < requiredPoints) {
    return NextResponse.json(
      { error: { code: "INSUFFICIENT_POINTS", message: "Insufficient points." } },
      { status: 400 }
    );
  }

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        userId: session.user.id,
        status: "PAID",
        totalCents: product.priceCents * parsed.data.qty,
        currency: product.currency,
        paidWith: "POINTS",
        shippingIncluded: true,
        provider: "STRIPE",
        items: {
          create: {
            productId: product.id,
            qty: parsed.data.qty,
            unitPriceCents: product.priceCents,
            unitPoints: product.pointsPrice
          }
        }
      }
    });

    await tx.pointsLedger.create({
      data: {
        userId: session.user.id,
        delta: -requiredPoints,
        reason: "SPEND",
        refType: "ORDER",
        refId: createdOrder.id
      }
    });

    return createdOrder;
  });

  return NextResponse.json({ orderId: order.id, pointsSpent: requiredPoints });
}
