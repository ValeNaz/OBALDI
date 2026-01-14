import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";
import { requireActiveMembership } from "@/src/core/membership/guard";
import { getAppBaseUrl } from "@/src/core/config";
import { getStripeClient } from "@/src/core/payments/stripe";

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
  try {
    session = await requireSession();
    await requireActiveMembership(session.user.id);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    throw error;
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

  const totalCents = product.priceCents * parsed.data.qty;

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      status: "CREATED",
      totalCents,
      currency: product.currency,
      paidWith: "MONEY",
      shippingIncluded: true,
      provider: "STRIPE",
      items: {
        create: {
          productId: product.id,
          qty: parsed.data.qty,
          unitPriceCents: product.priceCents,
          unitPoints: product.pointsPrice ?? null
        }
      }
    }
  });

  const checkout = await getStripeClient().checkout.sessions.create({
    mode: "payment",
    customer_email: session.user.email,
    line_items: [
      {
        price_data: {
          currency: product.currency.toLowerCase(),
          product_data: {
            name: product.title,
            description: product.description
          },
          unit_amount: product.priceCents
        },
        quantity: parsed.data.qty
      }
    ],
    success_url: `${getAppBaseUrl()}/marketplace?order_success=1`,
    cancel_url: `${getAppBaseUrl()}/product/${product.id}?cancel=1`,
    metadata: {
      kind: "ORDER",
      orderId: order.id
    }
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { providerPaymentId: checkout.id }
  });

  return NextResponse.json({
    orderId: order.id,
    url: checkout.url
  });
}
