import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

const schema = z.object({
  isOutOfStock: z.boolean().default(true)
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

  const product = await prisma.product.findUnique({
    where: { id: params.id }
  });

  if (!product) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Product not found." } },
      { status: 404 }
    );
  }

  const updated = await prisma.product.update({
    where: { id: params.id },
    data: { isOutOfStock: parsed.data.isOutOfStock }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "product.out_of_stock",
      entity: "product",
      entityId: updated.id,
      metadataJson: { isOutOfStock: updated.isOutOfStock }
    }
  });

  return NextResponse.json({ product: updated });
}
