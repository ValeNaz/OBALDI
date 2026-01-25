import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { requireSession } from "@/src/core/auth/guard";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    let userId: string | null = null;
    try {
        const session = await requireSession();
        userId = session.user.id;
    } catch {
        // Guest user, continue anyway
    }

    try {
        await prisma.productView.create({
            data: {
                productId: params.id,
                userId: userId
            }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to track view:", error);
        return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
    }
}
