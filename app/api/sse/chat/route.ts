import { NextRequest } from "next/server";
import { requireSession } from "@/src/core/auth/guard";
import { addConnection, removeConnection } from "@/lib/chat-events";

/**
 * GET /api/sse/chat
 * Establishes an SSE connection for real-time chat events.
 */
export async function GET(req: NextRequest) {
    try {
        const session = await requireSession();
        const userId = session.user.id;

        const stream = new ReadableStream({
            start(controller) {
                // Function to send data to this specific connection
                const send = (event: any) => {
                    try {
                        const chunk = `data: ${JSON.stringify(event)}\n\n`;
                        controller.enqueue(new TextEncoder().encode(chunk));
                    } catch (e) {
                        console.error(`SSE: Failed to enqueue for user ${userId}:`, e);
                    }
                };

                addConnection(userId, send);

                // Remove connection on close/abort
                req.signal.addEventListener('abort', () => {
                    removeConnection(send);
                });
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error("SSE Connection error:", error);
        return new Response("Unauthorized", { status: 401 });
    }
}
