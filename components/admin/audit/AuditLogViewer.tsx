"use client";

import { useEffect, useState } from "react";
import { FaHistory, FaSearch, FaCode } from "react-icons/fa";

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
                <div className="p-12 text-center text-slate-400">
                    <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-[#0b224e] rounded-full animate-spin mb-4" />
                    <p>Caricamento logs...</p>
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
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nessun log trovato.</td></tr>
                            ) : (
                                auditLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs font-mono">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-[#0b224e] whitespace-nowrap">
                                            {log.actorUser?.email ?? "Sistema"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 rounded bg-slate-100 font-mono text-xs font-bold text-slate-700">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {log.entity} <span className="text-slate-400 text-xs font-mono">{log.entityId}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <details className="group cursor-pointer">
                                                <summary className="text-xs text-[#0b224e] font-bold flex items-center gap-1 group-hover:underline list-none">
                                                    <FaCode /> JSON
                                                </summary>
                                                <pre className="mt-2 text-[10px] bg-slate-900 text-green-400 p-2 rounded overflow-x-auto max-w-[200px] md:max-w-md">
                                                    {JSON.stringify(log.metadataJson, null, 2)}
                                                </pre>
                                            </details>
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
