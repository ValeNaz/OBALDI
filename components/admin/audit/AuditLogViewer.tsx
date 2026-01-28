"use client";

import { useEffect, useState } from "react";
import { FaHistory, FaSearch, FaCode, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaUser, FaInfoCircle } from "react-icons/fa";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

type AuditLogEntry = {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    createdAt: string;
    actorUser: {
        id: string;
        email: string;
    } | null;
    metadataJson: Record<string, unknown>;
};

export default function AuditLogViewer() {
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [auditQuery, setAuditQuery] = useState("");
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditError, setAuditError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const load = async () => {
            try {
                setAuditLoading(true);
                setAuditError(null);
                const query = auditQuery.trim();
                const url = query.length > 0 ? `/api/admin/audit?q=${encodeURIComponent(query)}` : "/api/admin/audit";
                const response = await fetch(url, { signal: controller.signal });
                if (!response.ok) {
                    setAuditError("Impossibile caricare il log attività.");
                    return;
                }
                const data = await response.json();
                setAuditLogs(data.logs ?? []);
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    setAuditError("Impossibile caricare il log attività.");
                }
            } finally {
                setAuditLoading(false);
            }
        };

        const timeout = setTimeout(load, 500); // Debounce
        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [auditQuery]);

    const getActionVisuals = (action: string) => {
        const a = action.toUpperCase();
        if (a.includes("CREATE")) return { icon: <FaPlus className="text-green-500" />, bg: "bg-green-50", text: "text-green-700" };
        if (a.includes("UPDATE") || a.includes("EDIT")) return { icon: <FaEdit className="text-blue-500" />, bg: "bg-blue-50", text: "text-blue-700" };
        if (a.includes("DELETE") || a.includes("REMOVE")) return { icon: <FaTrash className="text-red-500" />, bg: "bg-red-50", text: "text-red-700" };
        if (a.includes("APPROVE") || a.includes("SUCCESS")) return { icon: <FaCheck className="text-emerald-500" />, bg: "bg-emerald-50", text: "text-emerald-700" };
        if (a.includes("REJECT") || a.includes("CANCEL") || a.includes("FAIL")) return { icon: <FaTimes className="text-rose-500" />, bg: "bg-rose-50", text: "text-rose-700" };
        if (a.includes("USER") || a.includes("MEMBER")) return { icon: <FaUser className="text-purple-500" />, bg: "bg-purple-50", text: "text-purple-700" };
        return { icon: <FaInfoCircle className="text-slate-500" />, bg: "bg-slate-50", text: "text-slate-700" };
    };

    return (
        <div className="glass-panel overflow-hidden">
            <div className="p-6 border-b border-white/70 flex md:flex-row flex-col gap-4 justify-between items-center">
                <h2 className="text-xl font-bold text-[#0b224e] flex items-center gap-2">
                    <FaHistory /> Audit Log
                </h2>
                <div className="relative w-full md:w-64">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cerca logs..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b224e]/20"
                        value={auditQuery}
                        onChange={(e) => setAuditQuery(e.target.value)}
                    />
                </div>
            </div>

            {auditError && (
                <div className="p-6 text-center text-red-600 bg-red-50">
                    {auditError}
                </div>
            )}

            {auditLoading && !auditError ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Entity</th>
                                <th className="px-6 py-4">Metadata</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <tr key={i} className="border-b border-slate-50">
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-3 w-24" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-32" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-5 w-16" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-28" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-3 w-10" />
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
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Entity</th>
                                <th className="px-6 py-4">Metadata</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {auditLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4">
                                        <EmptyState
                                            title="Nessun log"
                                            description="Non abbiamo trovato attività registrate che corrispondano ai criteri."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                auditLogs.map((log) => {
                                    const visuals = getActionVisuals(log.action);
                                    return (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-[10px] font-mono">
                                                <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                                                <div className="text-slate-300">{new Date(log.createdAt).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-[#0b224e] text-xs truncate max-w-[120px]" title={log.actorUser?.email ?? "Sistema"}>
                                                    {log.actorUser?.email.split('@')[0] ?? "Sistema"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${visuals.bg} ${visuals.text}`}>
                                                    {visuals.icon}
                                                    {log.action.replace(/_/g, " ")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-semibold text-slate-700">{log.entity}</div>
                                                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]" title={log.entityId ?? ""}>{log.entityId}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <details className="group cursor-pointer">
                                                    <summary className="text-[10px] text-[#0b224e] font-black flex items-center gap-1 group-hover:underline list-none uppercase tracking-tighter">
                                                        <FaCode size={10} /> Dati
                                                    </summary>
                                                    <div className="fixed md:relative z-50 md:z-auto left-4 right-4 md:left-auto md:right-auto mt-2">
                                                        <pre className="text-[9px] bg-slate-900 text-green-400 p-3 rounded-xl overflow-x-auto shadow-2xl border border-slate-800 max-h-40">
                                                            {JSON.stringify(log.metadataJson, null, 2)}
                                                        </pre>
                                                    </div>
                                                </details>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
