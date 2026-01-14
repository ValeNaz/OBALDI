import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import AdminDashboard from "./AdminDashboard";

const allowedRoles: UserRole[] = ["ADMIN"];

export default async function AdminPage() {
  try {
    const session = await requireSession();
    requireRole(session.user.role, allowedRoles);
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/");
    }
    throw error;
  }

  return <AdminDashboard />;
}
