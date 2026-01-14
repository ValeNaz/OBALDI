import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { verifyPayPalWebhookSignature } from "@/src/core/payments/paypal";

const paypalEventSchema = z
  .object({
    id: z.string(),
    event_type: z.string()
  })
  .passthrough();

export async function POST(request: Request) {
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

  try {
    await prisma.webhookEvent.create({
      data: {
        provider: "PAYPAL",
        eventId: parsed.data.id,
        type: parsed.data.event_type,
        payload: event as Record<string, unknown>
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
