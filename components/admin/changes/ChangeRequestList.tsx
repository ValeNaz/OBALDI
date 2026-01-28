"use client";

import { useEffect, useState } from "react";
import { FaExchangeAlt, FaCheck, FaTimes, FaSearch } from "react-icons/fa";

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

export default function ChangeRequestList() {
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
        const adminNote = window.prompt("Nota di approvazione (opzionale):") ?? undefined;
        const response = await fetch(
            `/api/admin/products/change-requests/${request.id}/approve`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminNote })
            }
        );

        if (!response.ok) {
            alert("Errore durante l'approvazione.");
            return;
        }

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
        const adminNote = window.prompt("Nota di rigetto (opzionale):") ?? undefined;
        const response = await fetch(
            `/api/admin/products/change-requests/${request.id}/reject`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminNote })
            }
        );

        if (!response.ok) {
            alert("Errore durante il rigetto.");
            return;
        }

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
                <div className="p-12 text-center text-slate-400">
                    <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-[#0b224e] rounded-full animate-spin mb-4" />
                    <p>Caricamento richieste...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Prodotto</th>
                                <th className="px-6 py-4">Seller</th>
                                <th className="px-6 py-4">Proposta</th>
                                <th className="px-6 py-4">Stato</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {changeRequests.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nessuna richiesta trovata.</td></tr>
                            ) : (
                                changeRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-[#0b224e]">{request.product.title}</td>
                                        <td className="px-6 py-4 text-sm">{request.seller.email}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            <details className="cursor-pointer group">
                                                <summary className="list-none group-hover:underline text-[#0b224e] font-bold">Vedi JSON</summary>
                                                <pre className="mt-2 p-2 bg-slate-100 rounded text-[10px] overflow-x-auto max-w-xs block border border-slate-200">
                                                    {JSON.stringify(request.proposedDataJson, null, 2)}
                                                </pre>
                                            </details>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${request.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                                    request.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {request.status === "PENDING" && (
                                                <>
                                                    <button
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors"
                                                        onClick={() => handleChangeApprove(request)}
                                                    >
                                                        Approva
                                                    </button>
                                                    <button
                                                        className="bg-[#a41f2e] hover:bg-red-800 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors"
                                                        onClick={() => handleChangeReject(request)}
                                                    >
                                                        Rigetta
                                                    </button>
                                                </>
                                            )}
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
