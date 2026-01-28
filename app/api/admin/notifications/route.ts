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

    // counts for badges
    const [pendingOrders, openAssist, pendingChanges] = await Promise.all([
        prisma.order.count({ where: { status: "PAID" } }), // In this context "PAID" might mean it needs fulfillment, but usually "PENDING" is better. Let's check status enum.
        prisma.purchaseAssistRequest.count({ where: { status: "OPEN" } }),
        prisma.productChangeRequest.count({ where: { status: "PENDING" } })
    ]);

    return NextResponse.json({
        counts: {
            orders: pendingOrders,
            assist: openAssist,
            changes: pendingChanges
        }
    });
}
