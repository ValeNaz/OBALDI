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
    data: { status: "APPROVED" }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "product.approved",
      entity: "product",
      entityId: updated.id,
      metadataJson: { status: updated.status }
    }
  });

  return NextResponse.json({ product: updated });
}
