"use client";

import { useEffect, useState } from "react";
import { FaHeadset, FaExternalLinkAlt, FaCheck, FaTimes } from "react-icons/fa";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

type PurchaseAssistRequest = {
    id: string;
    urlToCheck: string;
    notes: string | null;
    status: "OPEN" | "IN_REVIEW" | "DONE";
    outcome: string | null;
    createdAt: string;
    user: {
        id: string;
        email: string;
    };
};

import { useUI } from "@/context/UIContext";

export default function AssistRequestList() {
    const { showToast, confirm } = useUI();
    const [assistRequests, setAssistRequests] = useState<PurchaseAssistRequest[]>([]);
    const [assistStatus, setAssistStatus] = useState<"OPEN" | "IN_REVIEW" | "DONE">("OPEN");
    const [assistLoading, setAssistLoading] = useState(false);
    const [assistError, setAssistError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const load = async () => {
            try {
                setAssistLoading(true);
                setAssistError(null);
                const response = await fetch(`/api/admin/purchase-assist?status=${assistStatus}`, {
                    signal: controller.signal
                });
                if (!response.ok) {
                    setAssistError("Impossibile caricare le richieste di assistenza.");
                    return;
                }
                const data = await response.json();
                setAssistRequests(data.requests ?? []);
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    setAssistError("Impossibile caricare le richieste di assistenza.");
                }
            } finally {
                setAssistLoading(false);
            }
        };

        load();
        return () => controller.abort();
    }, [assistStatus]);

    const handleAssistUpdate = async (id: string, status: "OPEN" | "IN_REVIEW" | "DONE") => {
        let outcome: string | undefined = undefined;

        if (status === "DONE") {
            const outcomeRes = await confirm({
                title: "Completa Assistenza",
                message: "Stai per segnare questa richiesta come completata. Aggiungi un esito finale per l'utente.",
                confirmText: "Completa",
                variant: "primary",
                showPrompt: true,
                promptPlaceholder: "Esito (opzionale)..."
            });
            if (outcomeRes === false) return;
            outcome = outcomeRes as string;
        } else if (status === "OPEN") {
            const confirmed = await confirm({
                title: "Ripristina Richiesta",
                message: "Vuoi riportare questa richiesta allo stato 'Aperta'?",
                confirmText: "Ripristina",
                variant: "danger"
            });
            if (!confirmed) return;
        } else {
            const confirmed = await confirm({
                title: "Prendi in carico",
                message: "Vuoi prendere in carico questa richiesta di assistenza?",
                confirmText: "Conferma",
                variant: "primary"
            });
            if (!confirmed) return;
        }

        const response = await fetch(`/api/admin/purchase-assist/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, outcome })
        });

        if (!response.ok) {
            showToast("Errore durante l'aggiornamento.", "error");
            return;
        }

        setAssistRequests((prev) => prev.filter((item) => item.id !== id));
        showToast("Richiesta aggiornata con successo", "success");
    };

    return (
        <div className="glass-panel overflow-hidden">
            <div className="p-6 border-b border-white/70 flex md:flex-row flex-col gap-4 justify-between items-center">
                <h2 className="text-xl font-bold text-[#0b224e] flex items-center gap-2">
                    <FaHeadset /> Richieste Assistenza
                </h2>
                <div className="flex gap-2">
                    {(["OPEN", "IN_REVIEW", "DONE"] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setAssistStatus(status)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${assistStatus === status ? "bg-[#0b224e] text-white shadow" : "bg-white text-slate-500 hover:bg-slate-50"
                                }`}
                        >
                            {status === "OPEN" ? "Aperte" : status === "IN_REVIEW" ? "In revisione" : "Completate"}
                        </button>
                    ))}
                </div>
            </div>

            {assistError && (
                <div className="p-6 text-center text-red-600 bg-red-50">
                    {assistError}
                </div>
            )}

            {assistLoading && !assistError ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Data/Utente</th>
                                <th className="px-6 py-4 hidden md:table-cell">URL</th>
                                <th className="px-6 py-4 hidden lg:table-cell">Note</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-slate-50">
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-40 mb-2" />
                                        <Skeleton className="h-3 w-20" />
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <Skeleton className="h-4 w-12" />
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <Skeleton className="h-4 w-64" />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Skeleton className="h-8 w-24 rounded-full ml-auto" />
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
                                <th className="px-6 py-4">Data/Utente</th>
                                <th className="px-6 py-4 hidden md:table-cell">URL</th>
                                <th className="px-6 py-4 hidden lg:table-cell">Note</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {assistRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4">
                                        <EmptyState
                                            title="Nessuna richiesta"
                                            description="Non abbiamo trovato richieste di assistenza in questo stato."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                assistRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-[#0b224e] break-all">{req.user.email}</div>
                                            <div className="text-[10px] text-slate-400">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </div>
                                            {/* Mobile links/notes fallback */}
                                            <div className="md:hidden mt-1 flex flex-wrap gap-2">
                                                <a href={req.urlToCheck} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                                                    URL <FaExternalLinkAlt className="text-[8px]" />
                                                </a>
                                                {req.notes && <span className="text-[10px] text-slate-500 italic truncate max-w-[150px]">"{req.notes}"</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs hidden md:table-cell">
                                            <a href={req.urlToCheck} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                                Link <FaExternalLinkAlt className="text-[10px]" />
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 italic hidden lg:table-cell">
                                            "{req.notes || "Nessuna nota"}"
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-wrap justify-end gap-1.5">
                                                {req.status !== 'IN_REVIEW' && (
                                                    <button
                                                        onClick={() => handleAssistUpdate(req.id, "IN_REVIEW")}
                                                        className="bg-slate-100 text-[#0b224e] px-2.5 py-1 rounded-full text-[10px] font-bold hover:bg-slate-200"
                                                    >
                                                        {req.status === 'DONE' ? "Riapri" : "Prendi in carico"}
                                                    </button>
                                                )}
                                                {req.status !== 'DONE' && (
                                                    <button
                                                        onClick={() => handleAssistUpdate(req.id, "DONE")}
                                                        className="bg-green-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold hover:bg-green-700 shadow-sm"
                                                    >
                                                        Completa
                                                    </button>
                                                )}
                                                {req.status !== 'OPEN' && (
                                                    <button
                                                        onClick={() => handleAssistUpdate(req.id, "OPEN")}
                                                        className="bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-[10px] font-bold hover:bg-red-100"
                                                    >
                                                        Reset
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
