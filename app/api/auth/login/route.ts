import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { createSession } from "@/src/core/auth/session";
import { setSessionCookie } from "@/src/core/auth/cookies";
import { verifyPassword } from "@/src/core/auth/passwords";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "Credenziali non valide." } },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || !user.passwordHash) {
    return NextResponse.json(
      { error: { code: "INVALID_CREDENTIALS", message: "Credenziali non valide." } },
      { status: 401 }
    );
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json(
      { error: { code: "INVALID_CREDENTIALS", message: "Credenziali non valide." } },
      { status: 401 }
    );
  }

  const { session, token } = await createSession(user.id);
  const response = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
  setSessionCookie(response, token, session.expiresAt);
  return response;
}
