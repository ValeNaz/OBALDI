import { redirect } from "next/navigation";
import { AuthError, requireSession } from "@/src/core/auth/guard";
import { prisma } from "@/src/core/db";
import ChatContainer from "@/components/chat/ChatContainer";

export const metadata = {
    title: "Messaggi | Obaldi",
};

export default async function UserChatPage() {
    let session;
    try {
        session = await requireSession();
    } catch (error) {
        if (error instanceof AuthError) {
            redirect(`/login?error=${error.code}`);
        }
        throw error;
    }

    // Fetch initial conversations for this user
    const conversations = await prisma.conversation.findMany({
        where: {
            participants: {
                some: { userId: session.user.id }
            }
        },
        include: {
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        orderBy: { lastMessageAt: 'desc' }
    });

    return (
        <div className="container-max page-pad pt-28 md:pt-32 pb-20">
            <div className="mb-10">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e]">Messaggi</h1>
                <p className="text-slate-500 mt-2 max-w-2xl">
                    Comunica direttamente con il team di Obaldi. Qui troverai le tue richieste di supporto e le segnalazioni.
                </p>
            </div>

            <ChatContainer
                initialConversations={JSON.parse(JSON.stringify(conversations))}
                currentUser={session.user}
            />
        </div>
    );
}
