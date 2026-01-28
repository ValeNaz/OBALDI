import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import AuditLogViewer from "@/components/admin/audit/AuditLogViewer";

const allowedRoles: UserRole[] = ["ADMIN"];

export default async function AdminAuditPage() {
    try {
        const session = await requireSession();
        requireRole(session.user.role, allowedRoles);
    } catch (error) {
        if (error instanceof AuthError) {
            redirect(`/admin/login?error=${error.code}`);
        }
        throw error;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#0b224e]">Audit Log</h1>
                <p className="text-slate-500">Registro delle attività di sistema.</p>
            </div>
            <AuditLogViewer />
        </div>
    );
}
