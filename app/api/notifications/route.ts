import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: auth.user.id },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        const unreadCount = await prisma.notification.count({
            where: { userId: auth.user.id, isRead: false },
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
