import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import { enforceSameOrigin } from "@/src/core/security/csrf";

const schema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  specsJson: z.record(z.unknown()).optional(),
  priceCents: z.number().int().positive().optional(),
  currency: z.string().min(3).max(3).optional(),
  premiumOnly: z.boolean().optional(),
  pointsEligible: z.boolean().optional(),
  pointsPrice: z.number().int().positive().optional().nullable(),
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED"]).optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;

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
    data: {
      ...parsed.data,
      pointsPrice:
        parsed.data.pointsEligible === false ? null : parsed.data.pointsPrice
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "product.updated",
      entity: "product",
      entityId: updated.id,
      metadataJson: { updatedFields: Object.keys(parsed.data) }
    }
  });

  return NextResponse.json({ product: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;

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

  const hasOrders = await prisma.orderItem.findFirst({
    where: { productId: product.id }
  });

  if (hasOrders) {
    return NextResponse.json(
      {
        error: {
          code: "PRODUCT_IN_USE",
          message: "Product has orders and cannot be deleted."
        }
      },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.productMedia.deleteMany({
      where: { productId: product.id }
    });
    await tx.productChangeRequest.deleteMany({
      where: { productId: product.id }
    });
    await tx.product.delete({
      where: { id: product.id }
    });
    await tx.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: "product.deleted",
        entity: "product",
        entityId: product.id,
        metadataJson: { title: product.title }
      }
    });
  });

  return NextResponse.json({ deleted: true });
}
