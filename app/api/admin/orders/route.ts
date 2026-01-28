import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import { getClientIp, rateLimit } from "@/src/core/security/rate-limit";

const allowedStatuses = new Set(["CREATED", "PAID", "CANCELED", "REFUNDED"]);

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limiter = rateLimit({
    key: `admin:orders:list:${ip}`,
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

  try {
    const session = await requireSession();
    requireRole(session.user.role, ["ADMIN"]);

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const where: any = status && allowedStatuses.has(status) ? { status } : {};

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    });

    return NextResponse.json({
      orders: orders.map((order: any) => ({
        id: order.id,
        status: order.status,
        totalCents: order.totalCents,
        currency: order.currency,
        paidWith: order.paidWith,
        pointsSpent: order.pointsSpent,
        createdAt: order.createdAt,
        user: {
          id: order.user.id,
          email: order.user.email
        },
        items: order.items.map((item: any) => ({
          id: item.id,
          qty: item.qty,
          unitPriceCents: item.unitPriceCents,
          unitPoints: item.unitPoints,
          product: {
            id: item.product.id,
            title: item.product.title
          },
          variant: item.variant ? { title: item.variant.title } : null
        }))
      }))
    });
  } catch (error: any) {
    console.error("Admin orders API error:", error);
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Errore interno del server" } },
      { status: 500 }
    );
  }
}
