import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";
import { broadcastChatEvent } from "@/lib/chat-events";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await requireSession();
        const conversationId = params.id;

        // Upsert participant record to ensure it exists (especially for admins)
        await prisma.conversationParticipant.upsert({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId: session.user.id
                }
            },
            create: {
                conversationId,
                userId: session.user.id,
                lastReadAt: new Date()
            },
            update: {
                lastReadAt: new Date()
            }
        });

        // Fetch all participants to broadcast the read update
        const participants = await prisma.conversationParticipant.findMany({
            where: { conversationId },
            select: { userId: true }
        });
        const recipientIds = participants.map((p: { userId: string }) => p.userId);

        const readUpdate = { conversationId, userId: session.user.id, lastReadAt: new Date() };

        broadcastChatEvent({
            type: 'read_update',
            data: readUpdate,
            userIds: recipientIds
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("POST mark read error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
