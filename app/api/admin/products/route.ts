import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "PENDING";

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

  const products = await prisma.product.findMany({
    where: { status: status as "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ products });
}
