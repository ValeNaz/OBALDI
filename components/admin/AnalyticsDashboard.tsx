"use client";

import { useEffect, useState } from "react";
import { FaBox, FaCoins, FaShoppingCart, FaUsers, FaExclamationTriangle } from "react-icons/fa";
import { Skeleton } from "@/components/ui/Skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsData {
    metrics: {
        revenue: { current: number; previous: number };
        orders: number;
        activeMembers: number;
        lowStockCount?: number;
    };
    dailyRevenue?: { date: string; total: number }[];
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

    if (loading) return (
        <div className="space-y-8">
            <div className="mb-6">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
                <Skeleton className="h-6 w-32 mb-6" />
                <Skeleton className="h-64 w-full rounded-lg" />
            </div>
        </div>
    );
    if (!data || !data.metrics) return <div className="text-center py-10 text-slate-500">Dati non disponibili o errore caricamento.</div>;

    const { metrics, topSelling, dailyRevenue } = data;
    const revenueGrowth =
        metrics.revenue.previous > 0
            ? ((metrics.revenue.current - metrics.revenue.previous) / metrics.revenue.previous) * 100
            : 0;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-[#0b224e] dark:text-white">Panoramica (30gg)</h2>
                <p className="text-sm text-slate-500">Metriche chiave e andamento.</p>
            </div>

            {/* Cards */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* Revenue */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <FaCoins size={18} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fatturato</div>
                        <div className="text-xl font-bold text-[#0b224e] dark:text-white">
                            €{(metrics.revenue.current / 100).toFixed(2)}
                        </div>
                        <div className={`text-[10px] font-bold ${revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {revenueGrowth > 0 ? "+" : ""}
                            {revenueGrowth.toFixed(1)}% vs prec.
                        </div>
                    </div>
                </div>

                {/* Orders */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FaShoppingCart size={18} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ordini</div>
                        <div className="text-xl font-bold text-[#0b224e] dark:text-white">{metrics.orders}</div>
                        <div className="text-[10px] text-slate-400">Ultimi 30 giorni</div>
                    </div>
                </div>

                {/* Members */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <FaUsers size={18} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Membri</div>
                        <div className="text-xl font-bold text-[#0b224e] dark:text-white">{metrics.activeMembers}</div>
                        <div className="text-[10px] text-slate-400">Totale piattaforma</div>
                    </div>
                </div>

                {/* Low Stock */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <FaExclamationTriangle size={18} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scorte Basse</div>
                        <div className="text-xl font-bold text-[#0b224e] dark:text-white">{metrics.lowStockCount ?? 0}</div>
                        <div className="text-[10px] text-slate-400">Prodotti &lt; 5 pezzi</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-[400px]">
                    <h3 className="text-lg font-bold text-[#0b224e] dark:text-white mb-6">Andamento Vendite (30gg)</h3>
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyRevenue || []}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0b224e" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#0b224e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                                    formatter={(value: number | undefined) => [`€${typeof value === 'number' ? value.toFixed(2) : '0.00'}`, "Fatturato"]}
                                />
                                <Area type="monotone" dataKey="total" stroke="#0b224e" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-[#0b224e] dark:text-white mb-6 flex items-center gap-2">
                        <FaBox className="text-slate-400" />
                        Prodotti Top
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
                                            <span className="font-semibold text-[#0b224e] dark:text-white line-clamp-1 text-sm">{product.title}</span>
                                            <span className="text-xs text-slate-400 block md:hidden">ID: {product.productId.slice(0, 8)}</span>
                                        </div>
                                    </div>
                                    <div className="font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-xs whitespace-nowrap">
                                        {product.qty}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
