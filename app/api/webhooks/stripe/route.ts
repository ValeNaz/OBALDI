import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { getStripeClient, getStripeWebhookSecret } from "@/src/core/payments/stripe";

const stripeEventSchema = z.object({
  id: z.string(),
  type: z.string()
}).passthrough();

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

  try {
    await prisma.webhookEvent.create({
      data: {
        provider: "STRIPE",
        eventId: parsed.data.id,
        type: parsed.data.type,
        payload: event as unknown as Record<string, unknown>
      }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    throw error;
  }

  return NextResponse.json({ received: true });
}
