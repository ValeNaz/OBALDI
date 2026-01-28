import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  specsJson: z.any().default({}),
  priceCents: z.number().int().min(0),
  currency: z.string().min(3).max(3).default("EUR"),
  premiumOnly: z.boolean().default(false),
  pointsEligible: z.boolean().default(false),
  pointsPrice: z.number().int().positive().optional(),
  category: z.string().optional().default("OTHER")
});

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requireRole(session.user.role, ["SELLER", "ADMIN"]);

    const products = await prisma.product.findMany({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        media: {
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    return NextResponse.json({ products });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  console.log("Seller Product POST Body:", JSON.stringify(body, null, 2));

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: `Dati non validi: ${message}` } },
      { status: 400 }
    );
  }

  let session;
  try {
    session = await requireSession();
    requireRole(session.user.role, ["SELLER", "ADMIN"]);
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
      specsJson: typeof parsed.data.specsJson === 'string' ? JSON.parse(parsed.data.specsJson || '{}') : parsed.data.specsJson,
      priceCents: parsed.data.priceCents,
      currency: parsed.data.currency,
      status: "DRAFT",
      premiumOnly: parsed.data.premiumOnly,
      pointsEligible: parsed.data.pointsEligible,
      pointsPrice: parsed.data.pointsEligible ? parsed.data.pointsPrice ?? null : null,
      category: parsed.data.category as any
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
