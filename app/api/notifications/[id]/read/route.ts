import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { verifyAuth } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const auth = await verifyAuth(req);
    if (!auth.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const notification = await prisma.notification.updateMany({
            where: {
                id: params.id,
                userId: auth.user.id,
            },
            data: { isRead: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to mark notification as read:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
