"use client";

import { useEffect, useState } from "react";
import { FaHeadset, FaExternalLinkAlt, FaCheck, FaTimes } from "react-icons/fa";

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

export default function AssistRequestList() {
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

    const handleAssistUpdate = async (id: string, status: "IN_REVIEW" | "DONE") => {
        const outcome =
            status === "DONE"
                ? window.prompt("Esito (opzionale):") ?? undefined
                : undefined;
        const response = await fetch(`/api/admin/purchase-assist/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, outcome })
        });

        if (!response.ok) {
            alert("Errore durante l'aggiornamento.");
            return;
        }

        setAssistRequests((prev) => prev.filter((item) => item.id !== id));
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
                <div className="p-12 text-center text-slate-400">
                    <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-[#0b224e] rounded-full animate-spin mb-4" />
                    <p>Caricamento richieste...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Utente</th>
                                <th className="px-6 py-4">URL da verificare</th>
                                <th className="px-6 py-4">Note Utente</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {assistRequests.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nessuna richiesta in questo stato.</td></tr>
                            ) : (
                                assistRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-[#0b224e]">
                                            {req.user.email}
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <a href={req.urlToCheck} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                                Link <FaExternalLinkAlt className="text-[10px]" />
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 italic">
                                            "{req.notes || "Nessuna nota"}"
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {req.status === 'OPEN' && (
                                                <button
                                                    onClick={() => handleAssistUpdate(req.id, "IN_REVIEW")}
                                                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200"
                                                >
                                                    Prendi in carico
                                                </button>
                                            )}
                                            {req.status === 'IN_REVIEW' && (
                                                <button
                                                    onClick={() => handleAssistUpdate(req.id, "DONE")}
                                                    className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-bold hover:bg-green-200"
                                                >
                                                    Completa
                                                </button>
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
