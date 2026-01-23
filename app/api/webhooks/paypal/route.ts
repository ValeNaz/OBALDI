import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import {
  getPayPalSubscription,
  verifyPayPalWebhookSignature
} from "@/src/core/payments/paypal";
import { calculateRenewalPoints } from "@/src/core/membership/points";
import { getClientIp, rateLimit } from "@/src/core/security/rate-limit";
import { sendEmail } from "@/src/core/email/sender";
import { renderMembershipRenewal } from "@/src/core/email/templates";

const paypalEventSchema = z
  .object({
    id: z.string(),
    event_type: z.string()
  })
  .passthrough();

const getSubscriptionIdFromEvent = (event: Record<string, unknown>) => {
  const resource = event.resource as { id?: string; subscription_id?: string } | undefined;
  return resource?.id ?? resource?.subscription_id ?? null;
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limiter = rateLimit({
    key: `webhook:paypal:${ip}`,
    limit: 120,
    windowMs: 5 * 60 * 1000
  });

  if (!limiter.allowed) {
    const retryAfter = Math.ceil((limiter.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests." } },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const event = await request.json().catch(() => null);
  if (!event || typeof event !== "object") {
    return NextResponse.json(
      { error: { code: "INVALID_PAYLOAD", message: "Invalid payload." } },
      { status: 400 }
    );
  }

  const parsed = paypalEventSchema.safeParse(event);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_EVENT", message: "Invalid event payload." } },
      { status: 400 }
    );
  }

  const verified = await verifyPayPalWebhookSignature({
    headers: request.headers,
    event: event as Record<string, unknown>
  });

  if (!verified) {
    return NextResponse.json(
      { error: { code: "INVALID_SIGNATURE", message: "Invalid signature." } },
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
          provider: "PAYPAL",
          eventId: parsed.data.id,
          type: parsed.data.event_type,
          payload: event as Record<string, unknown>
        }
      });
    }

    const subscriptionId = getSubscriptionIdFromEvent(
      event as Record<string, unknown>
    );

    if (!subscriptionId) {
      await tx.webhookEvent.update({
        where: { eventId: parsed.data.id },
        data: { processedAt: new Date() }
      });
      return { handled: false };
    }

    const subscription = await getPayPalSubscription(subscriptionId);
    const membership = await tx.membership.findUnique({
      where: { providerSubId: subscription.id },
      include: { plan: true, user: { select: { email: true } } }
    });

    if (!membership) {
      await tx.auditLog.create({
        data: {
          actorUserId: null,
          action: "webhook.unmatched",
          entity: "membership",
          entityId: null,
          metadataJson: {
            provider: "PAYPAL",
            providerSubId: subscription.id,
            eventType: parsed.data.event_type
          }
        }
      });

      await tx.webhookEvent.update({
        where: { eventId: parsed.data.id },
        data: { processedAt: new Date() }
      });
      return { handled: false };
    }

    const lastPaymentTime = subscription.billing_info?.last_payment?.time;
    const nextBillingTime = subscription.billing_info?.next_billing_time;

    const nextPeriodStart = lastPaymentTime ? new Date(lastPaymentTime) : new Date();
    const nextPeriodEnd = nextBillingTime
      ? new Date(nextBillingTime)
      : new Date(Date.now() + 28 * 24 * 60 * 60 * 1000);

    const previousPeriodEnd = membership.currentPeriodEnd;

    await tx.membership.update({
      where: { id: membership.id },
      data: {
        status:
          subscription.status === "ACTIVE"
            ? "ACTIVE"
            : subscription.status === "SUSPENDED"
              ? "PAST_DUE"
              : subscription.status === "CANCELLED"
                ? "CANCELED"
                : "EXPIRED",
        currentPeriodStart: nextPeriodStart,
        currentPeriodEnd: nextPeriodEnd
      }
    });

    let pointsAwarded = 0;
    let membershipNotify:
      | {
          to: string;
          planCode: string;
          currentPeriodEnd: Date;
          pointsAwarded: number;
        }
      | null = null;
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
      if (membership.user?.email) {
        membershipNotify = {
          to: membership.user.email,
          planCode: membership.plan.code,
          currentPeriodEnd: nextPeriodEnd,
          pointsAwarded
        };
      }
    }

    await tx.auditLog.create({
      data: {
        actorUserId: membership.userId,
        action: "membership.renewed",
        entity: "membership",
        entityId: membership.id,
        metadataJson: {
          provider: "PAYPAL",
          eventType: parsed.data.event_type,
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

    return { handled: true, notify: membershipNotify };
  });

  if (result?.notify) {
    try {
      const emailContent = renderMembershipRenewal({
        planCode: result.notify.planCode,
        currentPeriodEnd: result.notify.currentPeriodEnd,
        pointsAwarded: result.notify.pointsAwarded
      });
      await sendEmail({ to: result.notify.to, ...emailContent });
    } catch {
      // Best-effort email delivery.
    }
  }

  return NextResponse.json({ received: true, ...result });
}
