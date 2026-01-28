import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { getAppBaseUrl } from "@/src/core/config";
import { getStripeClient } from "@/src/core/payments/stripe";
import { finalizeMembershipCheckout } from "@/src/core/membership/finalize";
import { createSession } from "@/src/core/auth/session";
import { setSessionCookie } from "@/src/core/auth/cookies";
import { sendEmail } from "@/src/core/email/sender";
import { renderMembershipConfirmation } from "@/src/core/email/templates";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("cs_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: { code: "MISSING_SESSION", message: "Missing checkout session." } },
      { status: 400 }
    );
  }

  const checkout = await prisma.checkoutSession.findUnique({
    where: { providerSessionId: sessionId }
  });

  if (!checkout) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Checkout session not found." } },
      { status: 404 }
    );
  }

  if (checkout.provider !== "STRIPE") {
    return NextResponse.json(
      { error: { code: "PROVIDER_MISMATCH", message: "Provider mismatch." } },
      { status: 400 }
    );
  }

  const stripeSession = await getStripeClient().checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"]
  });

  if (stripeSession.status !== "complete" && stripeSession.payment_status !== "paid") {
    return NextResponse.json(
      { error: { code: "NOT_PAID", message: "Checkout not completed." } },
      { status: 400 }
    );
  }

  const subscriptionId =
    typeof stripeSession.subscription === "string"
      ? stripeSession.subscription
      : stripeSession.subscription?.id;

  if (!subscriptionId) {
    return NextResponse.json(
      { error: { code: "SUBSCRIPTION_MISSING", message: "Subscription missing." } },
      { status: 400 }
    );
  }

  const subscription =
    typeof stripeSession.subscription === "string"
      ? await getStripeClient().subscriptions.retrieve(subscriptionId)
      : stripeSession.subscription;

  if (!subscription) {
    return NextResponse.json(
      { error: { code: "SUBSCRIPTION_NOT_FOUND", message: "Subscription detailed data missing." } },
      { status: 400 }
    );
  }

  const email =
    stripeSession.customer_details?.email ??
    stripeSession.customer_email ??
    checkout.email;

  if (!email) {
    return NextResponse.json(
      { error: { code: "EMAIL_MISSING", message: "Email missing." } },
      { status: 400 }
    );
  }

  const currentPeriodStart = new Date(subscription.current_period_start * 1000);
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  const { userId } = await finalizeMembershipCheckout({
    checkoutSessionId: checkout.id,
    email,
    provider: "STRIPE",
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
