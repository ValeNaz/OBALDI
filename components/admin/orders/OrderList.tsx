"use client";

import { useEffect, useState } from "react";
import { FaBox, FaCreditCard, FaUser, FaSearch } from "react-icons/fa";

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

export default function OrderList() {
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
        const note =
            status === "CANCELED" || status === "REFUNDED"
                ? window.prompt("Nota (opzionale):") ?? undefined
                : undefined;
        const response = await fetch(`/api/admin/orders/${order.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, note })
        });

        if (!response.ok) {
            alert("Errore durante l'aggiornamento ordine.");
            return;
        }

        const payload = await response.json().catch(() => null);
        if (!payload?.order) {
            return;
        }
        setOrders((prev) =>
            prev.map((item) => (item.id === order.id ? { ...item, status: payload.order.status } : item))
        );
    };

    const handleOrderRefund = async (order: AdminOrder) => {
        const reason = window.prompt("Motivo del rimborso (opzionale):") ?? undefined;
        const response = await fetch(`/api/admin/orders/${order.id}/refund`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason })
        });

        if (!response.ok) {
            alert("Errore durante il rimborso.");
            return;
        }

        const payload = await response.json().catch(() => null);
        if (!payload?.order) return;
        setOrders((prev) =>
            prev.map((item) => (item.id === order.id ? { ...item, status: payload.order.status } : item))
        );
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
                <div className="p-12 text-center text-slate-400">
                    <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-[#0b224e] rounded-full animate-spin mb-4" />
                    <p>Caricamento ordini...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">ID / Data</th>
                                <th className="px-6 py-4">Utente</th>
                                <th className="px-6 py-4">Totale</th>
                                <th className="px-6 py-4">Stato</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        Nessun ordine trovato.
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
                                        <td className="px-6 py-4">
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
                                            <div className="font-bold text-[#0b224e]">
                                                {(order.totalCents / 100).toLocaleString("it-IT", {
                                                    style: "currency",
                                                    currency: order.currency
                                                })}
                                            </div>
                                            {order.paidWith === "POINTS" && (
                                                <div className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                                    Punti: {order.pointsSpent}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
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
                                            <button
                                                onClick={() =>
                                                    setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                                                }
                                                className="text-[#0b224e] hover:bg-slate-100 p-2 rounded-full transition-colors mr-2"
                                                title="Vedi dettagli"
                                            >
                                                {expandedOrderId === order.id ? "Nascondi" : "Dettagli"}
                                            </button>

                                            {order.status === "PAID" && (
                                                <>
                                                    <button
                                                        onClick={() => handleOrderStatus(order, "CANCELED")}
                                                        className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors text-xs font-bold"
                                                    >
                                                        Annulla
                                                    </button>
                                                    <button
                                                        onClick={() => handleOrderRefund(order)}
                                                        className="text-purple-600 hover:bg-purple-50 p-2 rounded-full transition-colors text-xs font-bold ml-2"
                                                    >
                                                        Rimborsa
                                                    </button>
                                                </>
                                            )}
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
