import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import SellerDashboard from "./SellerDashboard";

const allowedRoles: UserRole[] = ["SELLER"];

export default async function SellerPage() {
  try {
    const session = await requireSession();
    requireRole(session.user.role, allowedRoles);
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/");
    }
    throw error;
  }

  return <SellerDashboard />;
}
