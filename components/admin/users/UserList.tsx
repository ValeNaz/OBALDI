"use client";

import { useEffect, useState } from "react";
import { FaUser, FaUserSlash, FaUserCheck, FaSearch, FaUsers } from "react-icons/fa";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

type AdminUser = {
    id: string;
    email: string;
    role: "MEMBER" | "SELLER" | "ADMIN";
    isDisabled: boolean;
    createdAt: string;
};

import { useUI } from "@/context/UIContext";

export default function UserList() {
    const { showToast, confirm } = useUI();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const load = async () => {
            try {
                setUsersLoading(true);
                setUsersError(null);
                const response = await fetch("/api/admin/users", { signal: controller.signal });
                if (!response.ok) {
                    setUsersError("Impossibile caricare gli utenti.");
                    return;
                }
                const data = await response.json();
                setUsers(data.users ?? []);
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    setUsersError("Impossibile caricare gli utenti.");
                }
            } finally {
                setUsersLoading(false);
            }
        };

        load();
        return () => controller.abort();
    }, []);

    const handleUserUpdate = async (user: AdminUser, data: Partial<AdminUser>) => {
        if (data.isDisabled !== undefined) {
            const confirmed = await confirm({
                title: data.isDisabled ? "Disabilita Utente" : "Riabilita Utente",
                message: `Sei sicuro di voler ${data.isDisabled ? 'disabilitare' : 'riabilitare'} l'utente ${user.email}?`,
                confirmText: data.isDisabled ? "Disabilita" : "Riabilita",
                variant: data.isDisabled ? "danger" : "primary"
            });
            if (!confirmed) return;
        }

        // Optimistic update
        const previousUsers = [...users];
        setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, ...data } : item)));

        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error("Failed update");
            }

            const payload = await response.json().catch(() => null);
            if (!payload?.user) throw new Error("Invalid response");

            // Confirm with server data
            setUsers((prev) => prev.map((item) => (item.id === user.id ? payload.user : item)));
            showToast("Utente aggiornato con successo", "success");
        } catch {
            // Rollback
            setUsers(previousUsers);
            showToast("Impossibile aggiornare l'utente.", "error");
        }
    };

    return (
        <div className="glass-panel overflow-hidden">
            <div className="p-6 border-b border-white/70">
                <h2 className="text-xl font-bold text-[#0b224e]">Utenti</h2>
            </div>

            {usersError && (
                <div className="p-6 text-center text-red-600 bg-red-50">
                    {usersError}
                </div>
            )}

            {usersLoading && !usersError ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 hidden sm:table-cell">Data Iscrizione</th>
                                <th className="px-6 py-4">Utente</th>
                                <th className="px-6 py-4 hidden md:table-cell">Ruolo</th>
                                <th className="px-6 py-4">Stato</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-slate-50">
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <Skeleton className="h-4 w-20" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-40 mb-2" />
                                        <Skeleton className="h-3 w-12 md:hidden" />
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-20" />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Skeleton className="h-8 w-8 rounded-full ml-auto" />
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
                                <th className="px-6 py-4 hidden sm:table-cell">Data Iscrizione</th>
                                <th className="px-6 py-4">Utente</th>
                                <th className="px-6 py-4 hidden md:table-cell">Ruolo</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Stato</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4">
                                        <EmptyState
                                            icon={<FaUsers size={24} />}
                                            title="Nessun utente"
                                            description="Non abbiamo trovato utenti nel sistema."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500 hidden sm:table-cell">
                                            {new Date(user.createdAt).toLocaleDateString("it-IT")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-[#0b224e] break-all text-xs md:text-sm">{user.email}</div>
                                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                <div className="md:hidden inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600">
                                                    {user.role}
                                                </div>
                                                <div className="sm:hidden">
                                                    {user.isDisabled ? (
                                                        <span className="text-red-500 font-bold text-[9px] flex items-center gap-1 uppercase">
                                                            <FaUserSlash size={8} /> Disabilitato
                                                        </span>
                                                    ) : (
                                                        <span className="text-green-600 font-bold text-[9px] flex items-center gap-1 uppercase">
                                                            <FaUserCheck size={8} /> Attivo
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                user.role === 'SELLER' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                    'bg-slate-100 text-slate-800 border-slate-200'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            {user.isDisabled ? (
                                                <span className="text-red-500 font-bold text-xs flex items-center gap-1">
                                                    <FaUserSlash /> Disabilitato
                                                </span>
                                            ) : (
                                                <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                                                    <FaUserCheck /> Attivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleUserUpdate(user, { isDisabled: !user.isDisabled })}
                                                className={`p-2 rounded-full transition-colors ${user.isDisabled
                                                    ? "text-green-600 hover:bg-green-50"
                                                    : "text-red-600 hover:bg-red-50"
                                                    }`}
                                                title={user.isDisabled ? "Riabilita utente" : "Disabilita utente"}
                                            >
                                                {user.isDisabled ? <FaUserCheck /> : <FaUserSlash />}
                                            </button>
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
