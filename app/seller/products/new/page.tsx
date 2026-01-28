import { requireRole, requireSession } from "@/src/core/auth/guard";
import CreateProductView from "@/components/admin/CreateProductView";

export const metadata = {
    title: "Nuovo Prodotto | Seller Console",
};

export default async function SellerNewProductPage() {
    const session = await requireSession();
    requireRole(session.user.role, ["SELLER"]);

    return (
        <CreateProductView
            userRole={session.user.role as "SELLER"} // Cast validated by requireRole
            userId={session.user.id}
            redirectBase="/seller/products"
        />
    );
}
