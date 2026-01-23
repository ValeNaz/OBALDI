import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import { enforceSameOrigin } from "@/src/core/security/csrf";
import { getStripeClient } from "@/src/core/payments/stripe";

const schema = z.object({
  reason: z.string().max(500).optional()
});

const resolvePaymentIntent = async (providerPaymentId: string) => {
  if (providerPaymentId.startsWith("pi_")) {
    return providerPaymentId;
  }

  if (providerPaymentId.startsWith("cs_")) {
    const session = await getStripeClient().checkout.sessions.retrieve(providerPaymentId);
    const paymentIntent = session.payment_intent;
    if (!paymentIntent) return null;
    return typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
  }

  return null;
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "Invalid request payload." } },
      { status: 400 }
    );
  }

  let session;
  try {
    session = await requireSession();
    requireRole(session.user.role, ["ADMIN"]);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    throw error;
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id }
  });

  if (!order) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Order not found." } },
      { status: 404 }
    );
  }

  if (order.status !== "PAID") {
    return NextResponse.json(
      { error: { code: "INVALID_STATUS", message: "Order not refundable." } },
      { status: 400 }
    );
  }

  const refundCashCents = order.totalCents - order.pointsSpent * 100;

  if (refundCashCents > 0) {
    if (order.provider !== "STRIPE") {
      return NextResponse.json(
        { error: { code: "NOT_SUPPORTED", message: "Refund provider not supported." } },
        { status: 400 }
      );
    }

    if (!order.providerPaymentId) {
      return NextResponse.json(
        { error: { code: "PAYMENT_ID_MISSING", message: "Payment reference missing." } },
        { status: 400 }
      );
    }

    const paymentIntentId = await resolvePaymentIntent(order.providerPaymentId);
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: { code: "PAYMENT_ID_INVALID", message: "Unable to resolve payment." } },
        { status: 400 }
      );
    }

    await getStripeClient().refunds.create({
      payment_intent: paymentIntentId,
      amount: refundCashCents
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: { status: "REFUNDED" }
    });

    if (order.pointsSpent > 0) {
      await tx.pointsLedger.create({
        data: {
          userId: order.userId,
          delta: order.pointsSpent,
          reason: "REFUND",
          refType: "ORDER",
          refId: order.id
        }
      });
    }

    await tx.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: "order.refunded",
        entity: "order",
        entityId: updatedOrder.id,
        metadataJson: {
          cashRefundCents: refundCashCents,
          pointsRefunded: order.pointsSpent,
          reason: parsed.data.reason ?? null
        }
      }
    });

    return updatedOrder;
  });

  return NextResponse.json({ order: updated });
}
