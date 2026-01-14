import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  specsJson: z.record(z.unknown()),
  priceCents: z.number().int().positive(),
  currency: z.string().min(3).max(3).default("EUR"),
  pointsEligible: z.boolean().default(false),
  pointsPrice: z.number().int().positive().optional()
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
    requireRole(session.user.role, ["SELLER"]);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    throw error;
  }

  if (parsed.data.pointsEligible && !parsed.data.pointsPrice) {
    return NextResponse.json(
      { error: { code: "POINTS_PRICE_REQUIRED", message: "Points price required." } },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: {
      sellerId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      specsJson: parsed.data.specsJson,
      priceCents: parsed.data.priceCents,
      currency: parsed.data.currency,
      status: "DRAFT",
      pointsEligible: parsed.data.pointsEligible,
      pointsPrice: parsed.data.pointsEligible ? parsed.data.pointsPrice ?? null : null
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "product.created",
      entity: "product",
      entityId: product.id,
      metadataJson: { status: product.status }
    }
  });

  return NextResponse.json({ product });
}
