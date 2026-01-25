
import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  let session;
  try {
    session = await requireSession();
    // Allow ADMIN to act as seller for testing
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

  const product = await prisma.product.findUnique({
    where: { id: params.id }
  });

  if (!product) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Product not found." } },
      { status: 404 }
    );
  }

  // Check ownership
  if (product.sellerId !== session.user.id) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Access denied." } },
      { status: 403 }
    );
  }

  if (product.status !== "DRAFT" && product.status !== "REJECTED") {
    return NextResponse.json(
      { error: { code: "INVALID_STATE", message: "Product is not in a submittable state." } },
      { status: 400 }
    );
  }

  const updated = await prisma.product.update({
    where: { id: params.id },
    data: { status: "PENDING" }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "product.submitted_for_review",
      entity: "product",
      entityId: updated.id,
      metadataJson: { status: updated.status }
    }
  });

  return NextResponse.json({ product: updated });
}
