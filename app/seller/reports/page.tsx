import { requireRole, requireSession } from "@/src/core/auth/guard";
import { prisma } from "@/src/core/db";
import ChatContainer from "@/components/chat/ChatContainer";

export const metadata = {
    title: "Segnalazioni Venditori | Seller Console",
};

export default async function SellerReportsPage() {
    const session = await requireSession();
    requireRole(session.user.role, ["SELLER"]);

    // Fetch vendor report conversations for the seller
    const conversations = await prisma.conversation.findMany({
        where: {
            type: 'VENDOR_REPORT',
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
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-4xl font-black text-[#0b224e] tracking-tight">Segnalazioni</h1>
                <p className="text-slate-500 mt-2 font-medium max-w-2xl">
                    Gestisci le tue segnalazioni riguardo ordini, pagamenti o comportamenti scorretti degli utenti.
                    Il nostro team esaminerà ogni caso con priorità.
                </p>
            </div>

            <ChatContainer
                initialConversations={JSON.parse(JSON.stringify(conversations))}
                currentUser={session.user}
                newConversationType="VENDOR_REPORT"
                newConversationLabel="Apri Nuova Segnalazione"
            />
        </div>
    );
}
