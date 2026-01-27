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
import { notifyOrderCreated } from "@/lib/notifications";
import { InventoryReason } from "@prisma/client";

const schema = z.object({
  usePoints: z.boolean().optional(),
  shippingAddressId: z.string().uuid().optional(),
  couponCode: z.string().max(30).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        qty: z.number().int().min(1).max(10)
      })
    )
    .min(1)
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
    key: `checkout:cart:${ip}`,
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

  if (parsed.data.usePoints && membership.plan.pointsPolicyType === "NONE") {
    return NextResponse.json(
      { error: { code: "POINTS_NOT_ALLOWED", message: "Points not allowed." } },
      { status: 400 }
    );
  }

  const itemMap = new Map<string, number>();
  for (const item of parsed.data.items) {
    itemMap.set(item.productId, (itemMap.get(item.productId) ?? 0) + item.qty);
  }

  const productIds = Array.from(itemMap.keys());
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  });

  if (products.length !== productIds.length) {
    return NextResponse.json(
      { error: { code: "PRODUCT_NOT_FOUND", message: "Product not found." } },
      { status: 404 }
    );
  }

  // Validate Shipping Address
  if (parsed.data.shippingAddressId) {
    const address = await prisma.address.findUnique({
      where: { id: parsed.data.shippingAddressId }
    });
    if (!address || address.userId !== session.user.id) {
      return NextResponse.json(
        { error: { code: "INVALID_ADDRESS", message: "Invalid shipping address." } },
        { status: 400 }
      );
    }
  }

  const currency = products[0]?.currency ?? "EUR";
  let totalCents = 0;
  let pointsCap = 0;

  for (const product of products) {
    const qty = itemMap.get(product.id) ?? 0;
    if (qty <= 0) continue;

    if (product.status !== "APPROVED") {
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

    // Inventory Check
    if (product.trackInventory && product.stockQty < qty) {
      return NextResponse.json(
        { error: { code: "INSUFFICIENT_STOCK", message: `Not enough stock for ${product.title}.` } },
        { status: 400 }
      );
    }

    if (product.premiumOnly && membership.plan.code !== "TUTELA") {
      return NextResponse.json(
        { error: { code: "PREMIUM_ONLY", message: "Premium membership required." } },
        { status: 403 }
      );
    }

    if (product.currency !== currency) {
      return NextResponse.json(
        { error: { code: "MIXED_CURRENCY", message: "Mixed currencies not allowed." } },
        { status: 400 }
      );
    }

    totalCents += product.priceCents * qty;
    if (product.pointsEligible && product.pointsPrice) {
      const maxByPrice = Math.floor(product.priceCents / 100);
      const maxByProduct = product.pointsPrice;
      const perUnit = Math.min(maxByPrice, maxByProduct);
      pointsCap += perUnit * qty;
    }
  }

  // Validate Coupon
  let coupon = null;
  let discountCents = 0;

  if (parsed.data.couponCode) {
    coupon = await prisma.coupon.findUnique({
      where: { code: parsed.data.couponCode.toUpperCase() }
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { error: { code: "INVALID_COUPON", message: "Invalid or inactive coupon." } },
        { status: 400 }
      );
    }

    // Validate coupon constraints
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return NextResponse.json({ error: { code: "COUPON_NOT_STARTED", message: "Coupon not yet valid." } }, { status: 400 });
    }
    if (coupon.validUntil && now > coupon.validUntil) {
      return NextResponse.json({ error: { code: "COUPON_EXPIRED", message: "Coupon expired." } }, { status: 400 });
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: { code: "COUPON_LIMIT_REACHED", message: "Coupon usage limit reached." } }, { status: 400 });
    }
    if (coupon.minOrderCents && totalCents < coupon.minOrderCents) {
      return NextResponse.json({ error: { code: "COUPON_MIN_ORDER", message: "Minimum order amount not met." } }, { status: 400 });
    }

    // Calculate discount
    if (coupon.type === "PERCENTAGE") {
      discountCents = Math.floor(totalCents * coupon.value / 10000);
    } else {
      discountCents = coupon.value;
    }

    if (coupon.maxDiscountCents && discountCents > coupon.maxDiscountCents) {
      discountCents = coupon.maxDiscountCents;
    }

    if (discountCents > totalCents) {
      discountCents = totalCents;
    }
  }

  let order;
  let pointsToUse = 0;
  let remainingCents = totalCents;

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const availablePoints = parsed.data.usePoints
          ? await getAvailablePoints(tx, session.user.id)
          : 0;
        const appliedPoints = parsed.data.usePoints
          ? Math.min(pointsCap, availablePoints)
          : 0;
        // Apply discount first, then points
        const afterDiscount = totalCents - discountCents;
        const finalRemaining = afterDiscount - appliedPoints * 100;

        // Ensure not negative
        const toPay = Math.max(0, finalRemaining);

        const createdOrder = await tx.order.create({
          data: {
            userId: session.user.id,
            status: toPay <= 0 ? "PAID" : "CREATED",
            totalCents: afterDiscount, // Store the post-discount total as the effective order total? Or keep original? Usually total is final amount. Let's store total to pay.
            // Actually, usually totalCents is the sum of items, and we have a discount field.
            // But for simplicity let's stick to the schema: totalCents is what user owes?
            // Let's keep totalCents as the GROSS total, and we have discountCents.
            totalCents: totalCents,
            discountCents: discountCents,
            couponId: coupon?.id,
            currency,
            paidWith: appliedPoints > 0 ? (toPay > 0 ? "MIXED" : "POINTS") : "MONEY",
            pointsSpent: appliedPoints,
            shippingIncluded: true,
            provider: "STRIPE",
            shippingAddressId: parsed.data.shippingAddressId,
            items: {
              create: products.map((product) => ({
                productId: product.id,
                qty: itemMap.get(product.id) ?? 1,
                unitPriceCents: product.priceCents,
                unitPoints: product.pointsPrice ?? null
              }))
            }
          }
        });

        // Decrement Inventory & Record Movement
        for (const product of products) {
          if (product.trackInventory) {
            const qty = itemMap.get(product.id) ?? 1;
            await tx.product.update({
              where: { id: product.id },
              data: {
                stockQty: { decrement: qty },
                isOutOfStock: product.stockQty - qty <= 0 // Simplified check, ideally re-check
              }
            });
            await tx.inventoryMovement.create({
              data: {
                productId: product.id,
                delta: -qty,
                reason: InventoryReason.ORDER,
                orderId: createdOrder.id
              }
            });
          }
        }

        // Increment Coupon Usage
        if (coupon) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } }
          });
          await tx.couponUsage.create({
            data: {
              couponId: coupon.id,
              userId: session.user.id,
              orderId: createdOrder.id
            }
          });
        }

        if (toPay <= 0 && appliedPoints > 0) {
          await tx.pointsLedger.create({
            data: {
              userId: session.user.id,
              delta: -appliedPoints,
              reason: "SPEND",
              refType: "ORDER",
              refId: createdOrder.id
            }
          });
        }

        return { createdOrder, remaining: toPay, appliedPoints };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    order = result.createdOrder;
    remainingCents = result.remaining;
    pointsToUse = result.appliedPoints;
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
      currency,
      pointsSpent: pointsToUse,
      items: products.map((product) => ({
        title: product.title,
        qty: itemMap.get(product.id) ?? 1,
        unitPriceCents: product.priceCents
      }))
    });
    try {
      await sendEmail({ to: session.user.email, ...emailContent });
    } catch {
      // Best-effort email delivery.
    }

    // Send notification for order created
    await notifyOrderCreated(session.user.id, order.id);

    return NextResponse.json({ orderId: order.id, pointsSpent: pointsToUse });
  }

  const checkout = await getStripeClient().checkout.sessions.create({
    mode: "payment",
    customer_email: session.user.email,
    line_items: products.map((product) => ({
      price_data: {
        currency: product.currency.toLowerCase(),
        product_data: {
          name: product.title,
          description: product.description
        },
        unit_amount: product.priceCents
      },
      quantity: itemMap.get(product.id) ?? 1
    })),
    success_url: `${getAppBaseUrl()}/marketplace?order_success=1`,
    cancel_url: `${getAppBaseUrl()}/checkout`,
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

  return NextResponse.json({ orderId: order.id, url: checkout.url });
}
