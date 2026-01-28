import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import { enforceSameOrigin } from "@/src/core/security/csrf";

const bodySchema = z.object({
  adminNote: z.string().max(500).optional()
});

const proposedSchema = z
  .object({
    title: z.string().min(2).optional(),
    description: z.string().min(10).optional(),
    specsJson: z.record(z.unknown()).optional(),
    priceCents: z.number().int().positive().optional(),
    currency: z.string().length(3).optional(),
    premiumOnly: z.boolean().optional(),
    pointsEligible: z.boolean().optional(),
    pointsPrice: z.number().int().positive().optional()
  })
  .strict();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;

  const body = await request.json().catch(() => null);
  const parsedBody = bodySchema.safeParse(body ?? {});

  if (!parsedBody.success) {
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

  const changeRequest = await prisma.productChangeRequest.findUnique({
    where: { id: params.id }
  });

  if (!changeRequest) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Change request not found." } },
      { status: 404 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: changeRequest.productId }
  });

  if (!product) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Product not found." } },
      { status: 404 }
    );
  }

  if (changeRequest.status !== "PENDING") {
    return NextResponse.json(
      { error: { code: "INVALID_STATUS", message: "Change request not pending." } },
      { status: 400 }
    );
  }

  const parsedChanges = proposedSchema.safeParse(changeRequest.proposedDataJson);
  if (!parsedChanges.success) {
    return NextResponse.json(
      { error: { code: "INVALID_CHANGES", message: "Change request data invalid." } },
      { status: 400 }
    );
  }

  const updateData: Record<string, any> = { ...parsedChanges.data };

  const nextPointsEligible =
    updateData.pointsEligible ?? product.pointsEligible;
  const nextPointsPrice = updateData.pointsPrice ?? product.pointsPrice;

  if (updateData.pointsPrice && !nextPointsEligible) {
    return NextResponse.json(
      { error: { code: "POINTS_NOT_ALLOWED", message: "Points not enabled." } },
      { status: 400 }
    );
  }

  if (nextPointsEligible && !nextPointsPrice) {
    return NextResponse.json(
      { error: { code: "POINTS_PRICE_REQUIRED", message: "Points price required." } },
      { status: 400 }
    );
  }

  if (nextPointsEligible === false) {
    updateData.pointsPrice = null;
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: { id: changeRequest.productId },
      data: updateData
    });

    const updated = await tx.productChangeRequest.update({
      where: { id: changeRequest.id },
      data: {
        status: "APPROVED",
        adminNote: parsedBody.data.adminNote ?? null
      }
    });

    await tx.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: "product.change_request.approved",
        entity: "product_change_request",
        entityId: updated.id,
        metadataJson: { productId: changeRequest.productId }
      }
    });

    return { updated, product: updatedProduct };
  });

  return NextResponse.json({ changeRequest: result.updated, product: result.product });
}
