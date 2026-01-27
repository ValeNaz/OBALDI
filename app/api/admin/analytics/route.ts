import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";

export async function GET() {
    let session;
    try {
        session = await requireSession();
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
        }
        throw error;
    }

    if (session.user.role !== "ADMIN") {
        return NextResponse.json({ error: { code: "FORBIDDEN", message: "Admin access required." } }, { status: 403 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Revenue Last 30 Days
    const revenueCurrentPeriod = await prisma.order.aggregate({
        _sum: { totalCents: true },
        where: {
            status: "PAID",
            createdAt: { gte: thirtyDaysAgo }
        }
    });

    const revenuePreviousPeriod = await prisma.order.aggregate({
        _sum: { totalCents: true },
        where: {
            status: "PAID",
            createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
        }
    });

    // Total Orders Last 30 Days
    const ordersCount = await prisma.order.count({
        where: {
            status: "PAID",
            createdAt: { gte: thirtyDaysAgo }
        }
    });

    // Active Members
    const activeMembers = await prisma.membership.count({
        where: { status: "ACTIVE" }
    });

    // Top Selling Products
    const topProducts = await prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { qty: true },
        orderBy: { _sum: { qty: "desc" } },
        take: 5
    });

    const productDetails = await prisma.product.findMany({
        where: { id: { in: topProducts.map((p) => p.productId) } },
        select: { id: true, title: true }
    });

    const topSelling = topProducts.map((p) => ({
        productId: p.productId,
        qty: p._sum.qty ?? 0,
        title: productDetails.find((d) => d.id === p.productId)?.title ?? "Unknown"
    }));

    return NextResponse.json({
        metrics: {
            revenue: {
                current: revenueCurrentPeriod._sum.totalCents ?? 0,
                previous: revenuePreviousPeriod._sum.totalCents ?? 0
            },
            orders: ordersCount,
            activeMembers
        },
        topSelling
    });
}
