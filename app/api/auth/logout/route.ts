import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearSessionCookie } from "@/src/core/auth/cookies";
import { deleteSessionByToken, SESSION_COOKIE_NAME } from "@/src/core/auth/session";
import { enforceSameOrigin } from "@/src/core/security/csrf";

export async function POST(request: Request) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;

  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await deleteSessionByToken(token);
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
