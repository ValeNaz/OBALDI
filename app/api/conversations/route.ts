import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";

/**
 * GET /api/conversations
 * List conversations for the current user.
 * Admin can see all or filter by userId or type.
 */
export async function GET(req: Request) {
    try {
        const session = await requireSession();
        const { searchParams } = new URL(req.url);
        const userIdFilter = searchParams.get('userId');
        const typeFilter = searchParams.get('type') as any;

        let where: any = {};

        if (session.user.role === 'ADMIN') {
            if (userIdFilter) {
                where.participants = { some: { userId: userIdFilter } };
            }
            if (typeFilter) {
                where.type = typeFilter;
            }
        } else {
            where.participants = { some: { userId: session.user.id } };
            if (typeFilter) {
                where.type = typeFilter;
            }
        }

        const conversations = await (prisma as any).conversation.findMany({
            where,
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                role: true,
                                avatarUrl: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { lastMessageAt: 'desc' }
        });

        return NextResponse.json({ conversations });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("GET /api/conversations ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * POST /api/conversations
 * Create a new conversation.
 */
export async function POST(req: Request) {
    try {
        const session = await requireSession();
        const { type, title, initialMessage } = await req.json();

        const conversationType = type || 'SUPPORT';

        // Authorization check for conversation type
        if (conversationType !== 'SUPPORT' && conversationType !== 'VENDOR_REPORT' && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized conversation type" }, { status: 403 });
        }

        // Check for existing support chat for regular users to avoid duplicates
        if (conversationType === 'SUPPORT' && session.user.role !== 'ADMIN') {
            const existing = await (prisma as any).conversation.findFirst({
                where: {
                    type: 'SUPPORT',
                    participants: {
                        some: { userId: session.user.id }
                    }
                },
                include: {
                    participants: true,
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            });
            if (existing) {
                return NextResponse.json({ conversation: existing });
            }
        }

        const conversation = await (prisma as any).conversation.create({
            data: {
                type: conversationType,
                title: title || (conversationType === 'VENDOR_REPORT' ? 'Segnalazione Venditore' : 'Chat di Supporto'),
                status: 'OPEN',
                participants: {
                    create: [
                        { userId: session.user.id }
                    ]
                },
                messages: {
                    create: [
                        ...(initialMessage ? [{
                            senderId: session.user.id,
                            body: initialMessage
                        }] : []),
                        // Fetch first admin or use a system-like automated message
                        // We need a real admin user ID because of foreign key constraint
                    ]
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                role: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        // Add automated welcome message from admin
        const firstAdmin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            select: { id: true }
        });

        if (firstAdmin) {
            await (prisma as any).message.create({
                data: {
                    conversationId: conversation.id,
                    senderId: firstAdmin.id,
                    body: "Grazie per averci contattato. Un amministratore prenderà in carico la tua richiesta e ti risponderà il prima possibile.",
                    isSystem: true
                }
            });

            // Update lastMessageAt to trigger SSE and order
            await (prisma as any).conversation.update({
                where: { id: conversation.id },
                data: { lastMessageAt: new Date() }
            });
        }

        return NextResponse.json({ conversation });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("POST /api/conversations ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
