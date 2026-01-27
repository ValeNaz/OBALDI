"use client";

import { useEffect, useState } from "react";
import { FaBox, FaCoins, FaShoppingCart, FaUsers } from "react-icons/fa";

interface AnalyticsData {
    metrics: {
        revenue: { current: number; previous: number };
        orders: number;
        activeMembers: number;
    };
    topSelling: {
        productId: string;
        qty: number;
        title: string;
    }[];
}

const AnalyticsDashboard = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/analytics")
            .then((res) => res.json())
            .then((json) => setData(json))
            .catch((err) => console.error("Analytics load failed", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-10 text-slate-500">Caricamento dashboard...</div>;
    if (!data || !data.metrics) return <div className="text-center py-10 text-slate-500">Dati non disponibili o errore caricamento.</div>;

    const { metrics, topSelling } = data;
    const revenueGrowth =
        metrics.revenue.previous > 0
            ? ((metrics.revenue.current - metrics.revenue.previous) / metrics.revenue.previous) * 100
            : 0;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#0b224e]">Panoramica (Ultimi 30 giorni)</h2>
                <p className="text-slate-500">Metriche chiave e andamento del business.</p>
            </div>

            {/* Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Revenue */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                        <FaCoins size={20} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fatturato</div>
                        <div className="text-2xl font-bold text-[#0b224e]">
                            €{(metrics.revenue.current / 100).toFixed(2)}
                        </div>
                        <div className={`text-xs font-bold ${revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {revenueGrowth > 0 ? "+" : ""}
                            {revenueGrowth.toFixed(1)}% vs mese scorso
                        </div>
                    </div>
                </div>

                {/* Orders */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FaShoppingCart size={20} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordini</div>
                        <div className="text-2xl font-bold text-[#0b224e]">{metrics.orders}</div>
                        <div className="text-xs text-slate-400">Ultimi 30 giorni</div>
                    </div>
                </div>

                {/* Members */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                        <FaUsers size={20} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Membri Attivi</div>
                        <div className="text-2xl font-bold text-[#0b224e]">{metrics.activeMembers}</div>
                        <div className="text-xs text-slate-400">Totale piattaforma</div>
                    </div>
                </div>
            </div>

            {/* Top Products */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-[#0b224e] mb-6 flex items-center gap-2">
                    <FaBox className="text-slate-400" />
                    Prodotti più venduti (Top 5)
                </h3>
                <div className="space-y-4">
                    {topSelling.length === 0 ? (
                        <div className="text-slate-400 italic text-sm text-center py-4">Nessun dato di vendita recente.</div>
                    ) : (
                        topSelling.map((product, i) => (
                            <div key={product.productId} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                                        {i + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-[#0b224e]">{product.title}</span>
                                        <span className="text-xs text-slate-400 block md:hidden">ID: {product.productId.slice(0, 8)}</span>
                                    </div>
                                </div>
                                <div className="font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-xs whitespace-nowrap">
                                    {product.qty} venduti
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
