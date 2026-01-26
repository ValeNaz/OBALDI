import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import { enforceSameOrigin } from "@/src/core/security/csrf";
import { notifyProductRejected } from "@/lib/notifications";

const schema = z.object({
  note: z.string().max(500).optional()
});

export async function POST(
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
    data: { status: "REJECTED" }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "product.rejected",
      entity: "product",
      entityId: updated.id,
      metadataJson: { status: updated.status, note: parsed.data.note ?? null }
    }
  });

  // Notify seller about product rejection
  await notifyProductRejected(product.sellerId, product.title, parsed.data.note);

  return NextResponse.json({ product: updated });
}

