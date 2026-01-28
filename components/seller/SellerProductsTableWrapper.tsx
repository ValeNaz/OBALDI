"use client";

import ProductListTable from "@/components/admin/ProductListTable";
import { useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";

export default function SellerProductsTableWrapper({ products }: { products: any[] }) {
    const router = useRouter();
    const { showToast, confirm } = useUI();

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: "Elimina Prodotto",
            message: "Sei sicuro di voler eliminare questo prodotto? Questa azione non può essere annullata.",
            confirmText: "Elimina",
            variant: "danger"
        });
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Errore durante l'eliminazione");
            showToast("Prodotto eliminato con successo", "success");
            router.refresh();
        } catch (err) {
            showToast("Errore durante l'eliminazione", "error");
        }
    };

    const handleSubmitForReview = async (id: string) => {
        const confirmed = await confirm({
            title: "Invia per Revisione",
            message: "Vuoi inviare questo prodotto per la revisione? Non potrai modificarlo finché l'admin non avrà terminato la revisione.",
            confirmText: "Invia",
            variant: "primary"
        });
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/seller/products/${id}/submit`, { method: "POST" });
            if (!res.ok) throw new Error("Errore durante l'invio");
            showToast("Prodotto inviato per la revisione", "success");
            router.refresh();
        } catch (err) {
            showToast("Errore durante l'invio per revisione", "error");
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
