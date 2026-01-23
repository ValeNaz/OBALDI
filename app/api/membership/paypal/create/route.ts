import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { createPayPalSubscription } from "@/src/core/payments/paypal";
import { getClientIp, rateLimit } from "@/src/core/security/rate-limit";
import { enforceSameOrigin } from "@/src/core/security/csrf";

const schema = z.object({
  planCode: z.enum(["ACCESSO", "TUTELA"]),
  email: z.string().email()
});

export async function POST(request: Request) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;

  const ip = getClientIp(request);
  const limiter = rateLimit({
    key: `membership:paypal:${ip}`,
    limit: 5,
    windowMs: 5 * 60 * 1000
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

  const plan = await prisma.membershipPlan.findUnique({
    where: { code: parsed.data.planCode }
  });

  if (!plan || !plan.isActive) {
    return NextResponse.json(
      { error: { code: "PLAN_NOT_AVAILABLE", message: "Plan not available." } },
      { status: 400 }
    );
  }

  const subscription = await createPayPalSubscription({
    planCode: parsed.data.planCode,
    email: parsed.data.email
  });

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.checkoutSession.create({
    data: {
      kind: "MEMBERSHIP",
      planId: plan.id,
      email: parsed.data.email,
      provider: "PAYPAL",
      providerSessionId: subscription.id,
      status: "CREATED",
      expiresAt
    }
  });

  return NextResponse.json({ url: subscription.approvalUrl });
}
