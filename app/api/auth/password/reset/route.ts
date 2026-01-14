import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/src/core/db";
import { hashPassword } from "@/src/core/auth/passwords";

const schema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8)
});

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "Richiesta non valida." } },
      { status: 400 }
    );
  }

  const tokenHash = hashToken(parsed.data.token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash }
  });

  if (!resetToken) {
    return NextResponse.json(
      { error: { code: "INVALID_TOKEN", message: "Token non valido." } },
      { status: 400 }
    );
  }

  if (resetToken.expiresAt <= new Date()) {
    await prisma.passwordResetToken.delete({
      where: { tokenHash }
    });
    return NextResponse.json(
      { error: { code: "TOKEN_EXPIRED", message: "Token scaduto." } },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash }
  });

  await prisma.passwordResetToken.delete({
    where: { tokenHash }
  });

  return NextResponse.json({ ok: true });
}
