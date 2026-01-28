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
        <div className="container-max page-pad pt-28 md:pt-32 pb-16">
            <div className="flex justify-between items-center mb-12">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-[#0b224e]">Console Amministrazione</h1>
                <div className="bg-white/70 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-red-100">
                    Accesso Protetto
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <AdminSidebar />
                </div>

                <div className="lg:col-span-3">
                    {children}
                </div>
            </div>
        </div>
    );
}
