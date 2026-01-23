import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";
import { requireActiveMembership } from "@/src/core/membership/guard";
import { getAppBaseUrl } from "@/src/core/config";
import { getStripeClient } from "@/src/core/payments/stripe";
import { getClientIp, rateLimit } from "@/src/core/security/rate-limit";
import { enforceSameOrigin } from "@/src/core/security/csrf";
import { sendEmail } from "@/src/core/email/sender";
import { renderOrderConfirmation } from "@/src/core/email/templates";

const schema = z.object({
  productId: z.string().uuid(),
  qty: z.number().int().min(1).max(10)
});

const getAvailablePoints = async (
  tx: Prisma.TransactionClient,
  userId: string
) => {
  const [ledger, reserved] = await Promise.all([
    tx.pointsLedger.aggregate({
      where: { userId },
      _sum: { delta: true }
    }),
    tx.order.aggregate({
      where: {
        userId,
        status: "CREATED",
        paidWith: "MIXED",
        pointsSpent: { gt: 0 }
      },
      _sum: { pointsSpent: true }
    })
  ]);

  const ledgerPoints = ledger._sum.delta ?? 0;
  const reservedPoints = reserved._sum.pointsSpent ?? 0;
  return ledgerPoints - reservedPoints;
};

export async function POST(request: Request) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;

  const ip = getClientIp(request);
  const limiter = rateLimit({
    key: `checkout:points:${ip}`,
    limit: 10,
    windowMs: 60 * 1000
  });

  if (!limiter.allowed) {
    const retryAfter = Math.ceil((limiter.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests." } },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

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

  if (product.premiumOnly && membership.plan.code !== "TUTELA") {
    return NextResponse.json(
      { error: { code: "PREMIUM_ONLY", message: "Premium membership required." } },
      { status: 403 }
    );
  }

  if (!product.pointsEligible || !product.pointsPrice) {
    return NextResponse.json(
      { error: { code: "POINTS_NOT_ELIGIBLE", message: "Points not eligible." } },
      { status: 400 }
    );
  }

  const totalCents = product.priceCents * parsed.data.qty;
  const maxPointsByPrice = Math.floor(totalCents / 100);
  const maxPointsByProduct = product.pointsPrice * parsed.data.qty;
  const pointsCap = Math.min(maxPointsByPrice, maxPointsByProduct);

  if (pointsCap <= 0) {
    return NextResponse.json(
      { error: { code: "POINTS_NOT_APPLICABLE", message: "Points not applicable." } },
      { status: 400 }
    );
  }

  let order;
  let pointsToUse = 0;
  let remainingCents = 0;

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const availablePoints = await getAvailablePoints(tx, session.user.id);
        const reservedPoints = Math.min(availablePoints, pointsCap);

        if (reservedPoints <= 0) {
          return { error: "INSUFFICIENT_POINTS" as const };
        }

        const remaining = totalCents - reservedPoints * 100;
        if (remaining <= 0) {
          const createdOrder = await tx.order.create({
            data: {
              userId: session.user.id,
              status: "PAID",
              totalCents,
              currency: product.currency,
              paidWith: "POINTS",
              pointsSpent: reservedPoints,
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
              delta: -reservedPoints,
              reason: "SPEND",
              refType: "ORDER",
              refId: createdOrder.id
            }
          });

          return { order: createdOrder, points: reservedPoints, remaining };
        }

        const createdOrder = await tx.order.create({
          data: {
            userId: session.user.id,
            status: "CREATED",
            totalCents,
            currency: product.currency,
            paidWith: "MIXED",
            pointsSpent: reservedPoints,
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

        return { order: createdOrder, points: reservedPoints, remaining };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    if ("error" in result) {
      return NextResponse.json(
        { error: { code: "INSUFFICIENT_POINTS", message: "Insufficient points." } },
        { status: 400 }
      );
    }

    order = result.order;
    pointsToUse = result.points;
    remainingCents = result.remaining;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "Please retry the request." } },
        { status: 409 }
      );
    }
    throw error;
  }

  if (remainingCents <= 0) {
    const emailContent = renderOrderConfirmation({
      orderId: order.id,
      totalCents,
      currency: product.currency,
      pointsSpent: pointsToUse,
      items: [
        {
          title: product.title,
          qty: parsed.data.qty,
          unitPriceCents: product.priceCents
        }
      ]
    });
    try {
      await sendEmail({ to: session.user.email, ...emailContent });
    } catch {
      // Best-effort email delivery.
    }
    return NextResponse.json({ orderId: order.id, pointsSpent: pointsToUse });
  }

  const checkout = await getStripeClient().checkout.sessions.create({
    mode: "payment",
    customer_email: session.user.email,
    line_items: [
      {
        price_data: {
          currency: product.currency.toLowerCase(),
          product_data: {
            name: product.title,
            description: "Saldo dopo utilizzo punti"
          },
          unit_amount: remainingCents
        },
        quantity: 1
      }
    ],
    success_url: `${getAppBaseUrl()}/marketplace?order_success=1`,
    cancel_url: `${getAppBaseUrl()}/product/${product.id}?cancel=1`,
    metadata: {
      kind: "ORDER",
      orderId: order.id,
      pointsSpent: String(pointsToUse)
    }
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { providerPaymentId: checkout.id }
  });

  return NextResponse.json({ orderId: order.id, url: checkout.url, pointsSpent: pointsToUse });
}
