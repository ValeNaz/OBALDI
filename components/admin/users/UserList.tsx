"use client";

import { useEffect, useState } from "react";
import { FaUser, FaUserSlash, FaUserCheck, FaSearch } from "react-icons/fa";

type AdminUser = {
    id: string;
    email: string;
    role: "MEMBER" | "SELLER" | "ADMIN";
    isDisabled: boolean;
    createdAt: string;
};

export default function UserList() {
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
        } catch {
            // Rollback
            setUsers(previousUsers);
            alert("Impossibile aggiornare l'utente.");
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
                <div className="p-12 text-center text-slate-400">
                    <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-[#0b224e] rounded-full animate-spin mb-4" />
                    <p>Caricamento utenti...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Data Iscrizione</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Ruolo</th>
                                <th className="px-6 py-4">Stato</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                        {new Date(user.createdAt).toLocaleDateString("it-IT")}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-[#0b224e]">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                user.role === 'SELLER' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                    'bg-slate-100 text-slate-800 border-slate-200'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
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
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
