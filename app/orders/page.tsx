"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type OrderItem = {
  id: string;
  qty: number;
  unitPriceCents: number;
  unitPoints: number | null;
  product: {
    id: string;
    title: string;
  };
};

type Order = {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  paidWith: string;
  createdAt: string;
  items: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/orders", { signal: controller.signal });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          setError(payload?.error?.message ?? "Impossibile caricare gli ordini.");
          return;
        }
        setOrders(payload.orders ?? []);
      } catch {
        setError("Impossibile caricare gli ordini.");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e]">I tuoi ordini</h1>
          <p className="text-slate-500 mt-2">Riepilogo degli acquisti completati.</p>
        </div>
        <Link href="/marketplace" className="text-sm font-bold text-[#0b224e]">
          Torna al Marketplace
        </Link>
      </div>

      {loading && (
        <div className="glass-panel p-8 text-center text-slate-500">Caricamento ordini...</div>
      )}
      {error && (
        <div className="glass-panel p-8 text-center text-slate-500">
          {error}{" "}
          <Link href="/login" className="text-[#0b224e] font-bold">
            Accedi
          </Link>
        </div>
      )}
      {!loading && !error && orders.length === 0 && (
        <div className="glass-panel p-8 text-center text-slate-500">
          Nessun ordine trovato.
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="glass-card card-pad space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Ordine</p>
                <p className="text-sm font-bold text-[#0b224e]">{order.id}</p>
              </div>
              <div className="text-sm text-slate-600">
                {new Date(order.createdAt).toLocaleDateString("it-IT")}
              </div>
              <div className="text-sm font-bold text-slate-700">
                €{(order.totalCents / 100).toFixed(2)} {order.currency}
              </div>
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {order.status}
              </div>
            </div>
            <div className="border-t border-slate-200/60 pt-4 space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between text-sm text-slate-600">
                  <Link href={`/product/${item.product.id}`} className="font-semibold text-[#0b224e]">
                    {item.product.title}
                  </Link>
                  <div className="text-slate-500">x{item.qty}</div>
                  <div className="text-slate-700">
                    €{(item.unitPriceCents / 100).toFixed(2)}
                    {item.unitPoints ? ` • ${item.unitPoints} punti` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
