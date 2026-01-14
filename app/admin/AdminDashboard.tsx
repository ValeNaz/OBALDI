"use client";

import { useEffect, useState } from "react";

type PendingProduct = {
  id: string;
  title: string;
  priceCents: number;
  sellerId: string;
};

const AdminDashboard = () => {
  const [pending, setPending] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/products?status=PENDING", {
          signal: controller.signal
        });
        if (!response.ok) {
          setError("Impossibile caricare i prodotti in coda.");
          return;
        }
        const data = await response.json();
        setPending(data.products ?? []);
      } catch {
        setError("Impossibile caricare i prodotti in coda.");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const handleApprove = async (id: string) => {
    const response = await fetch(`/api/admin/products/${id}/approve`, {
      method: "POST"
    });
    if (!response.ok) {
      setError("Errore durante l'approvazione.");
      return;
    }
    setPending((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReject = async (id: string) => {
    const note = window.prompt("Nota di rigetto (opzionale):") ?? undefined;
    const response = await fetch(`/api/admin/products/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note })
    });
    if (!response.ok) {
      setError("Errore durante il rigetto.");
      return;
    }
    setPending((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-16">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[#0b224e]">Console Amministrazione</h1>
        <div className="bg-white/70 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-red-100">
          Accesso Protetto
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <nav className="space-y-2 glass-panel p-4">
            <button className="w-full text-left p-3 rounded-xl bg-white/80 font-bold text-slate-900">
              Prodotti in coda ({pending.length})
            </button>
            <button className="w-full text-left p-3 rounded-xl hover:bg-white/60 font-medium text-slate-500">
              Gestione News
            </button>
            <button className="w-full text-left p-3 rounded-xl hover:bg-white/60 font-medium text-slate-500">
              Audit Log
            </button>
            <button className="w-full text-left p-3 rounded-xl hover:bg-white/60 font-medium text-slate-500">
              Gestione Utenti
            </button>
          </nav>
        </div>

        <div className="lg:col-span-3">
          <div className="glass-panel overflow-hidden">
            {error && (
              <div className="px-6 py-4 bg-red-50 text-red-700 text-sm font-semibold">
                {error}
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/70 text-slate-500 text-xs uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4">Prodotto</th>
                  <th className="px-6 py-4">Seller</th>
                  <th className="px-6 py-4">Prezzo</th>
                  <th className="px-6 py-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {pending.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 font-bold">{product.title}</td>
                    <td className="px-6 py-4">{product.sellerId}</td>
                    <td className="px-6 py-4">€{(product.priceCents / 100).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold"
                        onClick={() => handleApprove(product.id)}
                      >
                        Approva
                      </button>
                      <button
                        className="bg-[#a41f2e] text-white px-3 py-1.5 rounded text-xs font-bold"
                        onClick={() => handleReject(product.id)}
                      >
                        Rigetta
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && pending.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      Nessun prodotto in attesa di approvazione.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      Caricamento prodotti...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
