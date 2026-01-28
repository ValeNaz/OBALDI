import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";

import { requireRole, requireSession } from "@/src/core/auth/guard";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await requireSession();
    requireRole(session.user.role, ["ADMIN"]);

    return (
        <div className="container-max page-pad pt-24 md:pt-32 pb-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-display font-bold text-[#0b224e]">Console Amministrazione</h1>
                    <p className="text-slate-500 text-sm hidden md:block mt-1">Gestisci i contenuti e le attività della piattaforma.</p>
                </div>
                <div className="bg-white/70 text-red-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border border-red-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                    Accesso Protetto
                </div>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 lg:gap-8">
                <div className="w-full lg:col-span-1">
                    <AdminSidebar />
                </div>

                <div className="w-full lg:col-span-3">
                    {children}
                </div>
            </div>
        </div>
    );
}
