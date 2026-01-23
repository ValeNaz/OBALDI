import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";
import { hashPassword, verifyPassword } from "@/src/core/auth/passwords";
import { enforceSameOrigin } from "@/src/core/security/csrf";

const schema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8)
});

export async function POST(request: Request) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "Password non valida." } },
      { status: 400 }
    );
  }

  let session;
  try {
    session = await requireSession();
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
    where: { id: session.user.id }
  });

  if (!user) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Utente non trovato." } },
      { status: 404 }
    );
  }

  if (user.passwordHash) {
    if (!parsed.data.currentPassword) {
      return NextResponse.json(
        { error: { code: "CURRENT_REQUIRED", message: "Password attuale richiesta." } },
        { status: 400 }
      );
    }
    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: { code: "INVALID_CREDENTIALS", message: "Password attuale non corretta." } },
        { status: 401 }
      );
    }
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  });

  return NextResponse.json({ ok: true });
}
