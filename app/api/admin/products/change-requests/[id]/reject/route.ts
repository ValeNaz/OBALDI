import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import { enforceSameOrigin } from "@/src/core/security/csrf";

const bodySchema = z.object({
  adminNote: z.string().max(500).optional()
});

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

  if (changeRequest.status !== "PENDING") {
    return NextResponse.json(
      { error: { code: "INVALID_STATUS", message: "Change request not pending." } },
      { status: 400 }
    );
  }

  const updated = await prisma.productChangeRequest.update({
    where: { id: changeRequest.id },
    data: {
      status: "REJECTED",
      adminNote: parsedBody.data.adminNote ?? null
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "product.change_request.rejected",
      entity: "product_change_request",
      entityId: updated.id,
      metadataJson: { productId: changeRequest.productId }
    }
  });

  return NextResponse.json({ changeRequest: updated });
}
