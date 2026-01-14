import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";

export async function GET() {
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

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true
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
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        qty: item.qty,
        unitPriceCents: item.unitPriceCents,
        unitPoints: item.unitPoints,
        product: {
          id: item.product.id,
          title: item.product.title
        }
      }))
    }))
  });
}
