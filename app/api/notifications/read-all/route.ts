import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { verifyAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await prisma.notification.updateMany({
            where: {
                userId: auth.user.id,
                isRead: false,
            },
            data: { isRead: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to mark all notifications as read:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
