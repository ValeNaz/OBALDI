"use client";

import { useEffect, useState } from "react";
import { FaBox, FaCreditCard, FaUser, FaSearch, FaClipboardList } from "react-icons/fa";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

type AdminOrderItem = {
    id: string;
    qty: number;
    unitPriceCents: number;
    unitPoints: number | null;
    product: {
        id: string;
        title: string;
    };
    variant: {
        title: string;
    } | null;
};

type AdminOrder = {
    id: string;
    status: "CREATED" | "PAID" | "CANCELED" | "REFUNDED";
    totalCents: number;
    currency: string;
    paidWith: "MONEY" | "POINTS" | "MIXED";
    pointsSpent: number;
    createdAt: string;
    user: {
        id: string;
        email: string;
    };
    items: AdminOrderItem[];
};

import { useUI } from "@/context/UIContext";

export default function OrderList() {
    const { showToast, confirm } = useUI();
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [ordersStatus, setOrdersStatus] = useState<"ALL" | AdminOrder["status"]>("ALL");
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState<string | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const load = async () => {
            try {
                setOrdersLoading(true);
                setOrdersError(null);
                const query = ordersStatus === "ALL" ? "" : `?status=${ordersStatus}`;
                const response = await fetch(`/api/admin/orders${query}`, {
                    signal: controller.signal
                });
                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    setOrdersError(err.error?.message || "Impossibile caricare gli ordini.");
                    return;
                }
                const data = await response.json();
                setOrders(data.orders ?? []);
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    setOrdersError("Impossibile caricare gli ordini.");
                }
            } finally {
                setOrdersLoading(false);
            }
        };

        load();
        return () => controller.abort();
    }, [ordersStatus]);

    const handleOrderStatus = async (order: AdminOrder, status: AdminOrder["status"]) => {
        let note: string | undefined = undefined;

        if (status === "CANCELED" || status === "REFUNDED") {
            const noteRes = await confirm({
                title: status === "CANCELED" ? "Annulla Ordine" : "Rimborsa Ordine",
                message: `Stai per ${status === "CANCELED" ? 'annullare' : 'rimborsare'} l'ordine #${order.id.slice(0, 8)}. Puoi aggiungere una nota.`,
                confirmText: "Conferma",
                variant: "danger",
                showPrompt: true,
                promptPlaceholder: "Nota (opzionale)..."
            });
            if (noteRes === false) return;
            note = noteRes as string;
        } else {
            const confirmed = await confirm({
                title: "Aggiorna Stato Ordine",
                message: `Vuoi impostare lo stato dell'ordine #${order.id.slice(0, 8)} a ${status}?`,
                confirmText: "Aggiorna",
                variant: "primary"
            });
            if (!confirmed) return;
        }

        const response = await fetch(`/api/admin/orders/${order.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, note })
        });

        if (!response.ok) {
            showToast("Errore durante l'aggiornamento ordine.", "error");
            return;
        }

        const payload = await response.json().catch(() => null);
        if (!payload?.order) {
            return;
        }
        setOrders((prev) =>
            prev.map((item) => (item.id === order.id ? { ...item, status: payload.order.status } : item))
        );
        showToast("Ordine aggiornato con successo", "success");
    };

    const handleOrderRefund = async (order: AdminOrder) => {
        const reasonRes = await confirm({
            title: "Emetti Rimborso",
            message: `Stai per emettere un rimborso per l'ordine #${order.id.slice(0, 8)}. Indica il motivo.`,
            confirmText: "Rimborsa",
            variant: "danger",
            showPrompt: true,
            promptPlaceholder: "Motivo del rimborso (opzionale)..."
        });

        if (reasonRes === false) return;
        const reason = reasonRes as string;

        const response = await fetch(`/api/admin/orders/${order.id}/refund`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason })
        });

        if (!response.ok) {
            showToast("Errore durante il rimborso.", "error");
            return;
        }

        const payload = await response.json().catch(() => null);
        if (!payload?.order) return;
        setOrders((prev) =>
            prev.map((item) => (item.id === order.id ? { ...item, status: payload.order.status } : item))
        );
        showToast("Rimborso emesso con successo", "success");
    };

    return (
        <div className="glass-panel overflow-hidden">
            <div className="p-6 border-b border-white/70 flex flex-wrap gap-4 items-center justify-between">
                <h2 className="text-xl font-bold text-[#0b224e]">Gestione Ordini</h2>
                <div className="flex flex-wrap gap-2">
                    {(["ALL", "CREATED", "PAID", "CANCELED", "REFUNDED"] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setOrdersStatus(status)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${ordersStatus === status
                                ? "bg-[#0b224e] text-white shadow-md"
                                : "bg-white/70 text-slate-500 hover:bg-white"
                                }`}
                        >
                            {status === "ALL" ? "Tutti" : status}
                        </button>
                    ))}
                </div>
            </div>

            {ordersError && (
                <div className="p-6 text-center text-red-600 bg-red-50">
                    {ordersError}
                </div>
            )}

            {ordersLoading && !ordersError ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">ID / Data</th>
                                <th className="px-6 py-4 hidden md:table-cell">Utente</th>
                                <th className="px-6 py-4">Totale</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Stato</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-slate-50">
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-24 mb-2" />
                                        <Skeleton className="h-3 w-32" />
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="w-8 h-8 rounded-full" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-16 mb-1" />
                                        <Skeleton className="h-3 w-10 sm:hidden" />
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Skeleton className="h-8 w-16 rounded-full inline-block" />
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
                                <th className="px-6 py-4">ID / Data</th>
                                <th className="px-6 py-4 hidden md:table-cell">Utente</th>
                                <th className="px-6 py-4">Totale</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Stato</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4">
                                        <EmptyState
                                            icon={<FaClipboardList size={24} />}
                                            title="Nessun ordine"
                                            description="Non ci sono ordini che corrispondono a questo stato o ricerca."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs font-bold text-[#0b224e]">
                                                #{order.id.slice(0, 8)}...
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                {new Date(order.createdAt).toLocaleDateString("it-IT", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <FaUser size={12} />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {order.user.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-[#0b224e] flex items-center gap-2">
                                                {(order.totalCents / 100).toLocaleString("it-IT", {
                                                    style: "currency",
                                                    currency: order.currency
                                                })}
                                                <span className={`sm:hidden px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${order.status === "PAID" ? "bg-green-50 text-green-600 border-green-100" : "bg-slate-50 text-slate-500 border-slate-100"}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            {order.paidWith === "POINTS" && (
                                                <div className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                                    {order.pointsSpent} pts
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${order.status === "PAID"
                                                    ? "bg-green-100 text-green-800 border-green-200"
                                                    : order.status === "CANCELED"
                                                        ? "bg-red-100 text-red-800 border-red-200"
                                                        : order.status === "REFUNDED"
                                                            ? "bg-purple-100 text-purple-800 border-purple-200"
                                                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                    }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col sm:flex-row justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                                                    }
                                                    className="bg-slate-100 text-[#0b224e] px-3 py-1.5 rounded-full text-[10px] font-bold hover:bg-slate-200 transition"
                                                >
                                                    {expandedOrderId === order.id ? "Chiudi" : "Dettagli"}
                                                </button>

                                                {order.status === "PAID" && (
                                                    <div className="flex gap-1 justify-end">
                                                        <button
                                                            onClick={() => handleOrderStatus(order, "CANCELED")}
                                                            className="text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-colors text-[10px] font-bold"
                                                            title="Annulla"
                                                        >
                                                            Annulla
                                                        </button>
                                                        <button
                                                            onClick={() => handleOrderRefund(order)}
                                                            className="text-purple-600 hover:bg-purple-50 p-1.5 rounded-full transition-colors text-[10px] font-bold"
                                                            title="Rimborsa"
                                                        >
                                                            Rimborsa
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        {expandedOrderId === order.id && (
                                            <td colSpan={5} className="px-0 py-0 bg-slate-50 border-t border-b border-slate-100">
                                                <div className="p-6">
                                                    <h4 className="font-bold text-sm text-[#0b224e] mb-3">Articoli Acquistati</h4>
                                                    <div className="space-y-3">
                                                        {order.items.map((item) => (
                                                            <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200">
                                                                <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center text-slate-300">
                                                                    <FaBox />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="font-bold text-sm text-slate-800">{item.product.title}</div>
                                                                    {item.variant && (
                                                                        <div className="text-xs text-slate-500">{item.variant.title}</div>
                                                                    )}
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-mono text-xs font-bold">x{item.qty}</div>
                                                                    <div className="text-sm">
                                                                        {(item.unitPriceCents / 100).toLocaleString("it-IT", {
                                                                            style: "currency",
                                                                            currency: "EUR"
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        )}
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
