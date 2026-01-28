"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const SellerDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch("/api/seller/stats");
      if (res.ok) {
        setStats(await res.json());
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-[#0b224e]">Panoramica</h2>
          <p className="text-slate-500 mt-2">Bentornato! Ecco un riepilogo della tua attività.</p>
        </div>
        <Link
          href="/seller/products/new"
          className="bg-[#0b224e] text-white px-8 py-3 rounded-full font-bold shadow-glow-soft hover:shadow-lg transition transform hover:-translate-y-1"
        >
          + Nuovo Prodotto
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="glass-panel p-8">
          <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Prodotti Attivi</div>
          <div className="text-4xl font-display font-bold text-[#0b224e]">{stats?.activeProducts ?? 0}</div>
          <Link href="/seller/products?status=APPROVED" className="text-xs font-bold text-blue-600 mt-4 inline-block hover:underline">Gestisci prodotti &rarr;</Link>
        </div>
        <div className="glass-panel p-8 border-l-4 border-yellow-400">
          <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">In Revisione</div>
          <div className="text-4xl font-display font-bold text-[#0b224e]">{stats?.pendingProducts ?? 0}</div>
          <Link href="/seller/products?status=PENDING" className="text-xs font-bold text-blue-600 mt-4 inline-block hover:underline">Vedi dettagli &rarr;</Link>
        </div>
        <div className="glass-panel p-8">
          <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Ordini Ricevuti</div>
          <div className="text-4xl font-display font-bold text-[#0b224e]">{stats?.totalOrders ?? 0}</div>
          <button className="text-xs font-bold text-slate-400 mt-4 inline-block cursor-not-allowed">Prossimamente &rarr;</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8">
          <h2 className="text-xl font-bold text-[#0b224e] mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-[#0b224e] rounded-full"></span>
            Azioni Rapide
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/seller/products" className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#0b224e]/30 hover:bg-white transition group">
              <div className="font-bold text-[#0b224e] group-hover:text-blue-600">Catalogo</div>
              <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Gestione Totale</div>
            </Link>
            <Link href="/seller/products/new" className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#0b224e]/30 hover:bg-white transition group">
              <div className="font-bold text-[#0b224e] group-hover:text-blue-600">Aggiungi</div>
              <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Crea Prodotto</div>
            </Link>
          </div>
        </div>

        <div className="glass-panel p-8 bg-[#0b224e] text-white">
          <h2 className="text-xl font-bold mb-4">Supporto Venditori</h2>
          <p className="text-blue-100 text-sm leading-relaxed mb-6">
            Hai dubbi sulla gestione delle varianti o sulla spedizione dei tuoi prodotti?
            Il nostro team è qui per aiutarti a massimizzare le tue vendite.
          </p>
          <button className="w-full py-3 bg-white text-[#0b224e] rounded-full font-bold hover:bg-blue-50 transition">
            Contatta il Supporto
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
