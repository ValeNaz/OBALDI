import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import Link from "next/link";
import { FaBoxOpen, FaShoppingBag, FaUsers } from "react-icons/fa";

const allowedRoles: UserRole[] = ["ADMIN"];

export default async function AdminPage() {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0b224e]">Dashboard</h1>
        <p className="text-slate-500">Panoramica delle attività.</p>
      </div>

      <div className="glass-panel p-6 mb-8">
        <AnalyticsDashboard />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/products" className="glass-panel p-6 hover:shadow-lg transition flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
            <FaBoxOpen size={24} />
          </div>
          <div>
            <h3 className="font-bold text-[#0b224e] text-lg">Prodotti</h3>
            <p className="text-sm text-slate-500">Gestisci catalogo</p>
          </div>
        </Link>
        <Link href="/admin/orders" className="glass-panel p-6 hover:shadow-lg transition flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition">
            <FaShoppingBag size={24} />
          </div>
          <div>
            <h3 className="font-bold text-[#0b224e] text-lg">Ordini</h3>
            <p className="text-sm text-slate-500">Visualizza ordini</p>
          </div>
        </Link>
        <Link href="/admin/users" className="glass-panel p-6 hover:shadow-lg transition flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
            <FaUsers size={24} />
          </div>
          <div>
            <h3 className="font-bold text-[#0b224e] text-lg">Utenti</h3>
            <p className="text-sm text-slate-500">Gestione account</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
