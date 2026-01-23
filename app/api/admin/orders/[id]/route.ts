import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import { enforceSameOrigin } from "@/src/core/security/csrf";

const schema = z.object({
  status: z.enum(["CREATED", "PAID", "CANCELED", "REFUNDED"]),
  note: z.string().max(1000).optional()
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

  const order = await prisma.order.findUnique({
    where: { id: params.id }
  });

  if (!order) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Order not found." } },
      { status: 404 }
    );
  }

  if (order.status === parsed.data.status) {
    return NextResponse.json({ order });
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { status: parsed.data.status }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "order.status.updated",
      entity: "order",
      entityId: updated.id,
      metadataJson: {
        from: order.status,
        to: updated.status,
        note: parsed.data.note ?? null
      }
    }
  });

  return NextResponse.json({ order: updated });
}
