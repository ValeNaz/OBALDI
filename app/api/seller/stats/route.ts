import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { requireSession, requireRole, AuthError } from "@/src/core/auth/guard";

export async function GET() {
    try {
        const session = await requireSession();
        requireRole(session.user.role, ["SELLER"]);

        const [activeProducts, pendingProducts, totalOrders] = await Promise.all([
            prisma.product.count({
                where: { sellerId: session.user.id, status: "APPROVED" }
            }),
            prisma.product.count({
                where: { sellerId: session.user.id, status: "PENDING" }
            }),
            // For now, let's count orders where this seller has items
            prisma.order.count({
                where: {
                    items: {
                        some: {
                            product: {
                                sellerId: session.user.id
                            }
                        }
                    }
                }
            })
        ]);

        return NextResponse.json({
            activeProducts,
            pendingProducts,
            totalOrders
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: { message: error.message } }, { status: error.status });
        }
        console.error("Seller Stats Error:", error);
        return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
    }
}
