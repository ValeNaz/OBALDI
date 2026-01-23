import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

const allowedStatuses = new Set(["PENDING", "APPROVED", "REJECTED"]);

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

  if (status && !allowedStatuses.has(status)) {
    return NextResponse.json(
      { error: { code: "INVALID_STATUS", message: "Invalid status filter." } },
      { status: 400 }
    );
  }

  const requests = await prisma.productChangeRequest.findMany({
    where: status ? { status } : undefined,
    include: {
      product: { select: { id: true, title: true } },
      seller: { select: { id: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ requests });
}
