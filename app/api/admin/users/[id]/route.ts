import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import { enforceSameOrigin } from "@/src/core/security/csrf";

const schema = z.object({
  role: z.enum(["MEMBER", "SELLER", "ADMIN"]).optional(),
  isDisabled: z.boolean().optional()
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

  const user = await prisma.user.findUnique({
    where: { id: params.id }
  });

  if (!user) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "User not found." } },
      { status: 404 }
    );
  }

  if (user.id === session.user.id && parsed.data.isDisabled === true) {
    return NextResponse.json(
      { error: { code: "INVALID_ACTION", message: "Cannot disable yourself." } },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: {
      role: parsed.data.role ?? user.role,
      isDisabled: parsed.data.isDisabled ?? user.isDisabled
    }
  });

  if (parsed.data.isDisabled === true) {
    await prisma.session.deleteMany({
      where: { userId: updated.id }
    });
  }

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "user.updated",
      entity: "user",
      entityId: updated.id,
      metadataJson: {
        role: updated.role,
        isDisabled: updated.isDisabled
      }
    }
  });

  return NextResponse.json({ user: updated });
}
