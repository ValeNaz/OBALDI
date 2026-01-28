"use client";

import ProductListTable from "@/components/admin/ProductListTable";
import { useRouter } from "next/navigation";

export default function SellerProductsTableWrapper({ products }: { products: any[] }) {
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (!confirm("Sei sicuro di voler eliminare questo prodotto?")) return;
        try {
            const res = await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Errore durante l'eliminazione");
            alert("Prodotto eliminato");
            router.refresh();
        } catch (err) {
            alert("Errore eliminazione");
        }
    };

    const handleSubmitForReview = async (id: string) => {
        if (!confirm("Inviare per revisione?")) return;
        try {
            const res = await fetch(`/api/seller/products/${id}/submit`, { method: "POST" });
            if (!res.ok) throw new Error("Errore durante l'invio");
            alert("Inviato per revisione");
            router.refresh();
        } catch (err) {
            alert("Errore invio");
        }
    };

    return (
        <ProductListTable
            products={products}
            basePath="/seller/products"
            role="SELLER"
            onDelete={handleDelete}
            onSubmitForReview={handleSubmitForReview}
        />
    );
}
