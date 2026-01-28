import { requireRole, requireSession } from "@/src/core/auth/guard";
import CreateProductView from "@/components/admin/CreateProductView";

export const metadata = {
    title: "Nuovo Prodotto | Admin Console",
};

export default async function NewProductPage() {
    const session = await requireSession();
    requireRole(session.user.role, ["ADMIN"]);

    return <CreateProductView userRole={session.user.role} userId={session.user.id} />;
}
