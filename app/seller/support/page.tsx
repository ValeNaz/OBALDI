import { requireRole, requireSession } from "@/src/core/auth/guard";

export const metadata = {
    title: "Supporto Venditori | Seller Console",
};

export default async function SellerSupportPage() {
    const session = await requireSession();
    requireRole(session.user.role, ["SELLER"]);

    return (
        <div className="container-max page-pad py-8">
            <h1 className="text-3xl font-bold text-[#0b224e] mb-4">Supporto Venditori</h1>
            <div className="glass-panel p-8 text-center">
                <p className="text-lg text-slate-600 mb-4">Hai bisogno di aiuto?</p>
                <p className="text-slate-500 mb-8">Il sistema di ticketing dedicato sarà presto disponibile. <br />Nel frattempo, puoi contattarci via email.</p>
                <a href="mailto:support@obaldi.com" className="btn btn-primary inline-flex items-center gap-2">
                    Invia Email a Supporto
                </a>
            </div>
        </div>
    );
}
