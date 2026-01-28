import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";
import { broadcastChatEvent } from "@/lib/chat-events";
import { notifyNewMessage } from "@/lib/notifications";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await requireSession();
        const conversationId = params.id;

        // Authorization: Must be a participant or an admin
        if (session.user.role !== 'ADMIN') {
            const isParticipant = await (prisma as any).conversationParticipant.findUnique({
                where: {
                    conversationId_userId: {
                        conversationId,
                        userId: session.user.id
                    }
                }
            });
            if (!isParticipant) {
                return NextResponse.json({ error: "Access denied" }, { status: 403 });
            }
        }

        const { searchParams } = new URL(req.url);
        const cursor = searchParams.get('cursor');
        const limit = parseInt(searchParams.get('limit') || '50');

        const messages = await (prisma as any).message.findMany({
            where: { conversationId },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
        });

        let nextCursor: string | undefined = undefined;
        if (messages.length > limit) {
            const nextItem = messages.pop();
            nextCursor = nextItem?.id;
        }

        // We return them in chronological order for the UI
        return NextResponse.json({
            messages: messages.reverse(),
            nextCursor
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("GET messages error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await requireSession();
        const conversationId = params.id;
        const { body, attachmentUrl, metadataJson } = await req.json();

        if (!body && !attachmentUrl) {
            return NextResponse.json({ error: "Message content required" }, { status: 400 });
        }

        // Authorization
        if (session.user.role !== 'ADMIN') {
            const isParticipant = await (prisma as any).conversationParticipant.findUnique({
                where: {
                    conversationId_userId: {
                        conversationId,
                        userId: session.user.id
                    }
                }
            });
            if (!isParticipant) {
                return NextResponse.json({ error: "Access denied" }, { status: 403 });
            }
        }

        // Create message and update conversation in a transaction
        const [message] = await prisma.$transaction([
            (prisma as any).message.create({
                data: {
                    conversationId,
                    senderId: session.user.id,
                    body: body || "",
                    attachmentUrl,
                    metadataJson
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                            avatarUrl: true
                        }
                    }
                }
            }),
            (prisma as any).conversation.update({
                where: { id: conversationId },
                data: { lastMessageAt: new Date() }
            })
        ]);

        // If an Admin sends a message, ensure they are a participant to track read status
        if (session.user.role === 'ADMIN') {
            await (prisma as any).conversationParticipant.upsert({
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
                update: {} // Already exists
            });
        }

        // Fetch all participants to know who to broadcast to
        const participants = await (prisma as any).conversationParticipant.findMany({
            where: { conversationId },
            select: { userId: true }
        });
        const recipientIds = participants.map((p: { userId: string }) => p.userId);

        // Broadcast the new message event
        broadcastChatEvent({
            type: 'message',
            data: message,
            userIds: recipientIds
        });

        // Trigger notifications for recipients (excluding the sender)
        const notificationRecipients = (recipientIds as string[]).filter((rid: string) => rid !== session.user.id);
        const senderName = `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || 'Un utente';

        for (const rid of notificationRecipients as string[]) {
            // Need to know if this recipient is an admin to set the correct link
            // We can check if rid matches our list of admins or just pass a flag if we know
            // For now, let's keep it simple and the notification helper handles it if we can
            // but we don't know the recipient role here easily without a query.
            // Let's assume most recipients in this context aren't admins unlessrid is in participants where user.role is admin.

            // Actually, we already have participants list. Let's fetch their roles.
            const recipientUser = await prisma.user.findUnique({
                where: { id: rid },
                select: { role: true }
            });

            if (recipientUser) {
                await notifyNewMessage(
                    rid,
                    senderName,
                    conversationId,
                    recipientUser.role === 'ADMIN'
                );
            }
        }

        return NextResponse.json({ message });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("POST message error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await requireSession();
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        const conversationId = params.id;

        await (prisma.message as any).deleteMany({
            where: { conversationId }
        });

        // Fetch participants for broadcast
        const participants = await (prisma as any).conversationParticipant.findMany({
            where: { conversationId },
            select: { userId: true }
        });

        broadcastChatEvent({
            type: 'clear',
            data: { conversationId },
            userIds: participants.map((p: any) => p.userId)
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("DELETE messages error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
