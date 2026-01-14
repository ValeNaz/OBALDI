import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
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

  const product = await prisma.product.findUnique({
    where: { id: params.id }
  });

  if (!product || product.sellerId !== session.user.id) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Product not found." } },
      { status: 404 }
    );
  }

  if (product.status !== "DRAFT") {
    return NextResponse.json(
      { error: { code: "INVALID_STATUS", message: "Product not in draft." } },
      { status: 400 }
    );
  }

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: { status: "PENDING" }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "product.submitted",
      entity: "product",
      entityId: updated.id,
      metadataJson: { status: updated.status }
    }
  });

  return NextResponse.json({ product: updated });
}
