"use client";

import { useEffect, useState } from "react";
import { FaExchangeAlt, FaCheck, FaTimes, FaSearch } from "react-icons/fa";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

type ProductChangeRequest = {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminNote: string | null;
    createdAt: string;
    proposedDataJson: Record<string, unknown>;
    product: {
        id: string;
        title: string;
    };
    seller: {
        id: string;
        email: string;
    };
};

import { useUI } from "@/context/UIContext";

export default function ChangeRequestList() {
    const { showToast, confirm } = useUI();
    const [changeRequests, setChangeRequests] = useState<ProductChangeRequest[]>([]);
    const [changeStatus, setChangeStatus] = useState<
        ProductChangeRequest["status"] | "ALL"
    >("PENDING");
    const [changeLoading, setChangeLoading] = useState(false);
    const [changeError, setChangeError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const load = async () => {
            try {
                setChangeLoading(true);
                setChangeError(null);
                const query = changeStatus === "ALL" ? "" : `?status=${changeStatus}`;
                const response = await fetch(`/api/admin/products/change-requests${query}`, {
                    signal: controller.signal
                });
                if (!response.ok) {
                    setChangeError("Impossibile caricare le modifiche prodotto.");
                    return;
                }
                const data = await response.json();
                setChangeRequests(data.requests ?? []);
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    setChangeError("Impossibile caricare le modifiche prodotto.");
                }
            } finally {
                setChangeLoading(false);
            }
        };

        load();
        return () => controller.abort();
    }, [changeStatus]);

    const handleChangeApprove = async (request: ProductChangeRequest) => {
        const adminNoteRes = await confirm({
            title: "Approva Modifica",
            message: "Stai per approvare questa modifica prodotto. Puoi aggiungere una nota per il seller.",
            confirmText: "Approva",
            variant: "primary",
            showPrompt: true,
            promptPlaceholder: "Nota di approvazione (opzionale)..."
        });

        if (adminNoteRes === false) return;
        const adminNote = adminNoteRes as string;

        const response = await fetch(
            `/api/admin/products/change-requests/${request.id}/approve`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminNote })
            }
        );

        if (!response.ok) {
            showToast("Errore durante l'approvazione.", "error");
            return;
        }

        showToast("Modifica approvata", "success");

        // Remove from list if viewing pending, or update status if viewing all
        if (changeStatus === 'PENDING') {
            setChangeRequests((prev) => prev.filter((item) => item.id !== request.id));
        } else {
            const payload = await response.json().catch(() => null);
            if (payload?.changeRequest) {
                setChangeRequests(prev => prev.map(item => item.id === request.id ? payload.changeRequest : item));
            }
        }
    };

    const handleChangeReject = async (request: ProductChangeRequest) => {
        const adminNoteRes = await confirm({
            title: "Rigetta Modifica",
            message: "Stai per rigettare questa modifica prodotto. Indica la motivazione.",
            confirmText: "Rigetta",
            variant: "danger",
            showPrompt: true,
            promptPlaceholder: "Nota di rigetto (obbligatoria)..."
        });

        if (adminNoteRes === false) return;
        const adminNote = adminNoteRes as string;

        const response = await fetch(
            `/api/admin/products/change-requests/${request.id}/reject`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminNote })
            }
        );

        if (!response.ok) {
            showToast("Errore durante il rigetto.", "error");
            return;
        }

        showToast("Modifica rigettata", "info");

        if (changeStatus === 'PENDING') {
            setChangeRequests((prev) => prev.filter((item) => item.id !== request.id));
        } else {
            const payload = await response.json().catch(() => null);
            if (payload?.changeRequest) {
                setChangeRequests(prev => prev.map(item => item.id === request.id ? payload.changeRequest : item));
            }
        }
    };

    return (
        <div className="glass-panel overflow-hidden">
            <div className="p-6 border-b border-white/70 flex flex-wrap gap-4 items-center justify-between">
                <h2 className="text-xl font-bold text-[#0b224e] flex items-center gap-2">
                    <FaExchangeAlt /> Richieste Modifiche
                </h2>
                <div className="flex flex-wrap gap-2">
                    {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
                        <button
                            key={status}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition ${changeStatus === status
                                ? "bg-[#0b224e] text-white shadow"
                                : "bg-white/70 text-slate-500 hover:bg-white"
                                }`}
                            onClick={() => setChangeStatus(status)}
                        >
                            {status === "ALL"
                                ? "Tutte"
                                : status === "PENDING"
                                    ? "In attesa"
                                    : status === "APPROVED"
                                        ? "Approvate"
                                        : "Respinte"}
                        </button>
                    ))}
                </div>
            </div>

            {changeError && (
                <div className="p-6 text-center text-red-600 bg-red-50">
                    {changeError}
                </div>
            )}

            {changeLoading && !changeError ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Prodotto / Seller</th>
                                <th className="px-6 py-4 hidden md:table-cell">Proposta</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Stato</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-slate-50">
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-40 mb-2" />
                                        <Skeleton className="h-3 w-24" />
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <Skeleton className="h-4 w-16" />
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Skeleton className="h-8 w-32 rounded-full ml-auto" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Prodotto / Seller</th>
                                <th className="px-6 py-4 hidden md:table-cell">Proposta</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Stato</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {changeRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4">
                                        <EmptyState
                                            title="Nessuna richiesta"
                                            description="Non abbiamo trovato proposte di modifica nel sistema."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                changeRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-[#0b224e]">{request.product.title}</div>
                                            <div className="text-xs text-slate-500">{request.seller.email}</div>
                                            {/* Mobile status fallback */}
                                            <div className="sm:hidden mt-1">
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${request.status === 'PENDING' ? 'bg-orange-50 text-orange-600' : request.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 hidden md:table-cell">
                                            <details className="cursor-pointer group">
                                                <summary className="list-none group-hover:underline text-[#0b224e] font-bold">Vedi JSON</summary>
                                                <pre className="mt-2 p-2 bg-slate-100 rounded text-[10px] overflow-x-auto max-w-xs block border border-slate-200">
                                                    {JSON.stringify(request.proposedDataJson, null, 2)}
                                                </pre>
                                            </details>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${request.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                                request.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col sm:flex-row justify-end gap-1.5">
                                                {request.status !== "APPROVED" && (
                                                    <button
                                                        className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-colors shadow-sm"
                                                        onClick={() => handleChangeApprove(request)}
                                                    >
                                                        {request.status === "REJECTED" ? "Ripristina" : "Approva"}
                                                    </button>
                                                )}
                                                {request.status !== "REJECTED" && (
                                                    <button
                                                        className="bg-white border-2 border-[#a41f2e] text-[#a41f2e] px-2.5 py-1.5 rounded-full text-[10px] font-bold hover:bg-red-50 transition-colors"
                                                        onClick={() => handleChangeReject(request)}
                                                    >
                                                        {request.status === "APPROVED" ? "Annulla" : "Rigetta"}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
