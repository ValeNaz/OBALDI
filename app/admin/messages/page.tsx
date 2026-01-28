import { redirect } from "next/navigation";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import { prisma } from "@/src/core/db";
import AdminChatContainer from "@/components/admin/messages/AdminChatContainer";

export const metadata = {
    title: "Inbox Messaggi | Admin Panel",
};

export default async function AdminMessagesPage() {
    let session;
    try {
        session = await requireSession();
        requireRole(session.user.role, ["ADMIN"]);
    } catch (error) {
        if (error instanceof AuthError) {
            redirect(`/admin/login?error=${error.code}`);
        }
        throw error;
    }

    // Fetch initial conversations for admin
    const conversations = await (prisma as any).conversation.findMany({
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
        },
        orderBy: { lastMessageAt: 'desc' },
        take: 50
    });

    return (
        <div className="container-max py-8 px-4 md:px-10">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-[#0b224e] tracking-tight">Inbox Messaggi</h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Gestisci le richieste di assistenza e le segnalazioni venditori in tempo reale.
                </p>
            </div>

            <AdminChatContainer
                initialConversations={JSON.parse(JSON.stringify(conversations))}
                currentUser={session.user}
            />
        </div>
    );
}
