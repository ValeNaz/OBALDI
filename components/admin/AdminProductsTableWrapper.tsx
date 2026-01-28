"use client";

import ProductListTable from "@/components/admin/ProductListTable";
import { useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";

export default function AdminProductsTableWrapper({ products }: { products: any[] }) {
    const router = useRouter();
    const { showToast, confirm } = useUI();

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: "Elimina Prodotto",
            message: "Sei sicuro di voler eliminare questo prodotto? Questa azione è irreversibile.",
            confirmText: "Elimina",
            variant: "danger"
        });
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Errore durante l'eliminazione");
            showToast("Prodotto eliminato con successo", "success");
            router.refresh();
        } catch (err) {
            showToast("Errore eliminazione", "error");
        }
    };

    const handleApprove = async (id: string) => {
        const confirmed = await confirm({
            title: "Approva Prodotto",
            message: "Vuoi approvare e pubblicare questo prodotto nel catalogo?",
            confirmText: "Approva",
            variant: "primary"
        });
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/products/${id}/approve`, { method: "POST" });
            if (!res.ok) throw new Error("Errore durante l'approvazione");
            showToast("Prodotto approvato e pubblicato", "success");
            router.refresh();
        } catch (err) {
            showToast("Errore approvazione", "error");
        }
    };

    const handleReject = async (id: string) => {
        const note = await confirm({
            title: "Rifiuta Prodotto",
            message: "Indica la motivazione del rifiuto per aiutare il seller a correggere il prodotto.",
            confirmText: "Rifiuta",
            variant: "danger",
            showPrompt: true,
            promptPlaceholder: "Motivazione del rifiuto..."
        });

        if (note === false) return; // User cancelled

        try {
            const res = await fetch(`/api/admin/products/${id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note })
            });
            if (!res.ok) throw new Error("Errore durante il rifiuto");
            showToast("Prodotto rifiutato", "info");
            router.refresh();
        } catch (err) {
            showToast("Errore rifiuto", "error");
        }
    };


    const handleBulkAction = async (action: string, ids: string[]) => {
        const actionLabel = action === "DELETE" ? "eliminare" : action === "APPROVE" ? "approvare" : "rifiutare";
        const confirmed = await confirm({
            title: "Conferma azione massiva",
            message: `Sei sicuro di voler ${actionLabel} ${ids.length} prodotti selezionati?`,
            confirmText: "Procedi",
            variant: action === "DELETE" || action === "REJECT" ? "danger" : "primary"
        });

        if (!confirmed) return;

        try {
            const res = await fetch("/api/admin/products/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, ids })
            });

            if (!res.ok) throw new Error("Errore durante l'operazione massiva");
            const data = await res.json();
            showToast(`Operazione completata su ${data.count} prodotti`, "success");
            router.refresh();
        } catch (err) {
            showToast("Errore operazione massiva", "error");
        }
    };

    return (
        <ProductListTable
            products={products}
            basePath="/admin/products"
            role="ADMIN"
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
            onBulkAction={handleBulkAction}
        />
    );
}
