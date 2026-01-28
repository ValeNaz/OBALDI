import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

const allowedStatuses = new Set(["OPEN", "IN_REVIEW", "DONE"]);

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const where = status && allowedStatuses.has(status) ? { status: status as "OPEN" | "IN_REVIEW" | "DONE" } : {};

  const requests = await prisma.purchaseAssistRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          email: true
        }
      }
    }
  });

  return NextResponse.json({ requests });
}
