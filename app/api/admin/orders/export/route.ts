import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

const allowedStatuses = new Set(["CREATED", "PAID", "CANCELED", "REFUNDED"]);

const escapeCsv = (value: string) => {
  if (value.includes("\n") || value.includes(",") || value.includes("\"")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

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
  const where = status && allowedStatuses.has(status) ? { status: status as "CREATED" | "PAID" | "CANCELED" | "REFUNDED" } : {};

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { email: true }
      },
      items: {
        include: {
          product: {
            select: { title: true }
          }
        }
      }
    }
  });

  const header = [
    "id",
    "status",
    "totalCents",
    "currency",
    "paidWith",
    "pointsSpent",
    "createdAt",
    "userEmail",
    "items"
  ];

  const rows = orders.map((order) => {
    const items = order.items
      .map((item) => `${item.product.title} x${item.qty}`)
      .join("; ");

    return [
      order.id,
      order.status,
      String(order.totalCents),
      order.currency,
      order.paidWith,
      String(order.pointsSpent ?? 0),
      order.createdAt.toISOString(),
      order.user.email,
      items
    ].map(escapeCsv);
  });

  const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=orders.csv"
    }
  });
}
