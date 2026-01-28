import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import { getClientIp, rateLimit } from "@/src/core/security/rate-limit";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limiter = rateLimit({
    key: `admin:users:list:${ip}`,
    limit: 60,
    windowMs: 60 * 1000
  });

  if (!limiter.allowed) {
    const retryAfter = Math.ceil((limiter.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests." } },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
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

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      isDisabled: true,
      createdAt: true
    }
  });

  return NextResponse.json({ users });
}
