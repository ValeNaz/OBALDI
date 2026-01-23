import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { getAppBaseUrl } from "@/src/core/config";
import { createSession } from "@/src/core/auth/session";
import { setSessionCookie } from "@/src/core/auth/cookies";
import { getPayPalSubscription } from "@/src/core/payments/paypal";
import { finalizeMembershipCheckout } from "@/src/core/membership/finalize";
import { sendEmail } from "@/src/core/email/sender";
import { renderMembershipConfirmation } from "@/src/core/email/templates";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const subscriptionId =
    url.searchParams.get("sub_id") ?? url.searchParams.get("subscription_id");

  if (!subscriptionId) {
    return NextResponse.json(
      { error: { code: "MISSING_SUBSCRIPTION", message: "Missing subscription." } },
      { status: 400 }
    );
  }

  const checkout = await prisma.checkoutSession.findUnique({
    where: { providerSessionId: subscriptionId }
  });

  if (!checkout) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Checkout session not found." } },
      { status: 404 }
    );
  }

  if (checkout.provider !== "PAYPAL") {
    return NextResponse.json(
      { error: { code: "PROVIDER_MISMATCH", message: "Provider mismatch." } },
      { status: 400 }
    );
  }

  const subscription = await getPayPalSubscription(subscriptionId);
  if (subscription.status !== "ACTIVE") {
    return NextResponse.json(
      { error: { code: "NOT_ACTIVE", message: "Subscription not active." } },
      { status: 400 }
    );
  }

  const lastPaymentTime = subscription.billing_info?.last_payment?.time;
  const nextBillingTime = subscription.billing_info?.next_billing_time;

  const currentPeriodStart = lastPaymentTime
    ? new Date(lastPaymentTime)
    : new Date();
  const currentPeriodEnd = nextBillingTime
    ? new Date(nextBillingTime)
    : new Date(Date.now() + 28 * 24 * 60 * 60 * 1000);

  const { userId } = await finalizeMembershipCheckout({
    checkoutSessionId: checkout.id,
    email: checkout.email,
    provider: "PAYPAL",
    providerSubId: subscriptionId,
    planId: checkout.planId,
    currentPeriodStart,
    currentPeriodEnd
  });

  const membership = await prisma.membership.findUnique({
    where: { userId },
    include: { plan: true, user: true }
  });

  if (membership?.user?.email) {
    const emailContent = renderMembershipConfirmation({
      planCode: membership.plan.code,
      currentPeriodEnd: membership.currentPeriodEnd
    });
    try {
      await sendEmail({ to: membership.user.email, ...emailContent });
    } catch {
      // Best-effort email delivery.
    }
  }

  const { session, token } = await createSession(userId);
  const response = NextResponse.redirect(`${getAppBaseUrl()}/membership?success=1`);
  setSessionCookie(response, token, session.expiresAt);
  return response;
}
