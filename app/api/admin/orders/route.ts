import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

const allowedStatuses = new Set(["CREATED", "PAID", "CANCELED", "REFUNDED"]);

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
  const where = status && allowedStatuses.has(status) ? { status } : {};

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, email: true }
      },
      items: {
        include: {
          product: {
            select: { id: true, title: true }
          }
        }
      }
    }
  });

  return NextResponse.json({
    orders: orders.map((order) => ({
      id: order.id,
      status: order.status,
      totalCents: order.totalCents,
      currency: order.currency,
      paidWith: order.paidWith,
      pointsSpent: order.pointsSpent,
      createdAt: order.createdAt,
      user: order.user,
      items: order.items.map((item) => ({
        id: item.id,
        qty: item.qty,
        unitPriceCents: item.unitPriceCents,
        unitPoints: item.unitPoints,
        product: item.product
      }))
    }))
  });
}
