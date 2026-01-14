import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { getStripeClient, getStripeWebhookSecret } from "@/src/core/payments/stripe";
import { calculateRenewalPoints } from "@/src/core/membership/points";

const stripeEventSchema = z.object({
  id: z.string(),
  type: z.string()
}).passthrough();

const mapStripeStatus = (status: Stripe.Subscription.Status) => {
  if (status === "active" || status === "trialing") {
    return "ACTIVE";
  }
  if (status === "past_due" || status === "unpaid") {
    return "PAST_DUE";
  }
  if (status === "canceled") {
    return "CANCELED";
  }
  return "EXPIRED";
};

const getStripeSubscription = async (
  event: Stripe.Event
): Promise<Stripe.Subscription | null> => {
  if (event.type === "customer.subscription.updated") {
    return event.data.object as Stripe.Subscription;
  }

  if (
    event.type === "invoice.payment_succeeded" ||
    event.type === "invoice.paid"
  ) {
    const invoice = event.data.object as Stripe.Invoice;
    if (!invoice.subscription) return null;
    const subscriptionId =
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription.id;
    return getStripeClient().subscriptions.retrieve(subscriptionId);
  }

  return null;
};

const handleOrderCheckout = async (
  event: Stripe.Event,
  tx: Prisma.TransactionClient
) => {
  if (event.type !== "checkout.session.completed") {
    return { handled: false };
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata ?? {};

  if (metadata.kind !== "ORDER" || !metadata.orderId) {
    return { handled: false };
  }

  const order = await tx.order.findUnique({
    where: { id: metadata.orderId }
  });

  if (!order) {
    await tx.auditLog.create({
      data: {
        actorUserId: null,
        action: "webhook.unmatched",
        entity: "order",
        entityId: null,
        metadataJson: {
          provider: "STRIPE",
          eventType: event.type,
          orderId: metadata.orderId
        }
      }
    });
    return { handled: false };
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (order.status !== "PAID") {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        providerPaymentId: paymentIntentId ?? order.providerPaymentId ?? session.id
      }
    });

    await tx.auditLog.create({
      data: {
        actorUserId: order.userId,
        action: "order.paid",
        entity: "order",
        entityId: order.id,
        metadataJson: {
          provider: "STRIPE",
          eventType: event.type,
          paymentIntentId
        }
      }
    });
  }

  return { handled: true };
};

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: { code: "MISSING_SIGNATURE", message: "Signature missing." } },
      { status: 400 }
    );
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret()
    );
  } catch (error) {
    return NextResponse.json(
      { error: { code: "INVALID_SIGNATURE", message: "Invalid signature." } },
      { status: 400 }
    );
  }

  const parsed = stripeEventSchema.safeParse(event);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_EVENT", message: "Invalid event payload." } },
      { status: 400 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.webhookEvent.findUnique({
      where: { eventId: parsed.data.id }
    });

    if (existing?.processedAt) {
      return { duplicate: true };
    }

    if (!existing) {
      await tx.webhookEvent.create({
        data: {
          provider: "STRIPE",
          eventId: parsed.data.id,
          type: parsed.data.type,
          payload: event as unknown as Record<string, unknown>
        }
      });
    }

    const orderHandled = await handleOrderCheckout(event, tx);
    if (orderHandled.handled) {
      await tx.webhookEvent.update({
        where: { eventId: parsed.data.id },
        data: { processedAt: new Date() }
      });
      return { handled: true, kind: "order" };
    }

    const subscription = await getStripeSubscription(event);
    if (!subscription) {
      await tx.webhookEvent.update({
        where: { eventId: parsed.data.id },
        data: { processedAt: new Date() }
      });
      return { handled: false };
    }

    const membership = await tx.membership.findUnique({
      where: { providerSubId: subscription.id },
      include: { plan: true }
    });

    if (!membership) {
      await tx.auditLog.create({
        data: {
          actorUserId: null,
          action: "webhook.unmatched",
          entity: "membership",
          entityId: null,
          metadataJson: {
            provider: "STRIPE",
            providerSubId: subscription.id,
            eventType: parsed.data.type
          }
        }
      });

      await tx.webhookEvent.update({
        where: { eventId: parsed.data.id },
        data: { processedAt: new Date() }
      });
      return { handled: false };
    }

    const nextPeriodStart = new Date(subscription.current_period_start * 1000);
    const nextPeriodEnd = new Date(subscription.current_period_end * 1000);
    const previousPeriodEnd = membership.currentPeriodEnd;

    await tx.membership.update({
      where: { id: membership.id },
      data: {
        status: mapStripeStatus(subscription.status),
        currentPeriodStart: nextPeriodStart,
        currentPeriodEnd: nextPeriodEnd
      }
    });

    let pointsAwarded = 0;
    if (nextPeriodEnd.getTime() > previousPeriodEnd.getTime()) {
      pointsAwarded = calculateRenewalPoints(membership.plan);
      if (pointsAwarded > 0) {
        await tx.pointsLedger.create({
          data: {
            userId: membership.userId,
            delta: pointsAwarded,
            reason: "RENEWAL",
            refType: "MEMBERSHIP",
            refId: membership.id
          }
        });
      }
    }

    await tx.auditLog.create({
      data: {
        actorUserId: membership.userId,
        action: "membership.renewed",
        entity: "membership",
        entityId: membership.id,
        metadataJson: {
          provider: "STRIPE",
          eventType: parsed.data.type,
          previousPeriodEnd: previousPeriodEnd.toISOString(),
          nextPeriodEnd: nextPeriodEnd.toISOString(),
          pointsAwarded
        }
      }
    });

    await tx.webhookEvent.update({
      where: { eventId: parsed.data.id },
      data: { processedAt: new Date() }
    });

    return { handled: true };
  });

  return NextResponse.json({ received: true, ...result });
}
