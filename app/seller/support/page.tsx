import { requireRole, requireSession } from "@/src/core/auth/guard";
import { prisma } from "@/src/core/db";
import ChatContainer from "@/components/chat/ChatContainer";

export const metadata = {
    title: "Supporto Venditori | Seller Console",
};

export default async function SellerSupportPage() {
    const session = await requireSession();
    requireRole(session.user.role, ["SELLER"]);

    // Fetch conversations for the seller
    const conversations = await prisma.conversation.findMany({
        where: {
            type: 'SUPPORT',
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
        <div className="container-max page-pad py-8 px-4 md:px-0">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-[#0b224e] tracking-tight">Supporto Venditori</h1>
                <p className="text-slate-500 mt-2 font-medium max-w-2xl">Parla con il team di Obaldi per assistenza tecnica o amministrativa sulla tua console venditore.</p>
            </div>

            <ChatContainer
                initialConversations={JSON.parse(JSON.stringify(conversations))}
                currentUser={session.user}
                newConversationType="SUPPORT"
                newConversationLabel="Apri Ticket Supporto"
            />
        </div>
    );
}
