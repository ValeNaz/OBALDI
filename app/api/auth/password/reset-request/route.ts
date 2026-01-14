import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/src/core/db";
import { getAppBaseUrl } from "@/src/core/config";
import { sendEmail } from "@/src/core/email/sender";

const schema = z.object({
  email: z.string().email()
});

const generateToken = () => crypto.randomBytes(32).toString("hex");

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "Email non valida." } },
      { status: 400 }
    );
  }

  const email = parsed.data.email;
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id }
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt
    }
  });

  const resetUrl = `${getAppBaseUrl()}/reset-password?token=${token}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reimposta la password Obaldi",
      html: `
        <p>Hai richiesto di reimpostare la password.</p>
        <p>Apri questo link per continuare:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Il link scade tra 60 minuti.</p>
      `,
      text: `Apri questo link per reimpostare la password: ${resetUrl}`
    });
  } catch {
    return NextResponse.json(
      { error: { code: "EMAIL_ERROR", message: "Impossibile inviare l'email." } },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
