"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaBox, FaTruck, FaCheckCircle, FaMapMarkerAlt, FaChevronLeft } from "react-icons/fa";

interface OrderTracking {
    order: {
        id: string;
        status: string;
        totalCents: number;
        currency: string;
        createdAt: string;
        items: {
            productTitle: string;
            qty: number;
            unitPriceCents: number;
        }[];
    };
    shipment: {
        status: string;
        carrier?: string;
        trackingCode?: string;
        trackingUrl?: string;
        estimatedAt?: string;
        shippedAt?: string;
        deliveredAt?: string;
    } | null;
    shippingAddress: {
        fullName: string;
        line1: string;
        line2?: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    } | null;
}

const OrderTrackingPage = () => {
    const params = useParams();
    const orderId = params?.id as string;
    const [data, setData] = useState<OrderTracking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) return;

        fetch(`/api/orders/${orderId}/tracking`)
            .then(async (res) => {
                if (!res.ok) throw new Error("Impossible to load order.");
                return res.json();
            })
            .then(setData)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [orderId]);

    if (loading) return (
        <div className="container-max page-pad pt-32 pb-16 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#0b224e] border-t-transparent animate-spin" />
        </div>
    );

    if (error || !data) return (
        <div className="container-max page-pad pt-32 pb-16 text-center">
            <div className="text-red-500 font-semibold mb-4">{error || "Order not found"}</div>
            <Link href="/orders" className="text-[#0b224e] underline">Back to orders</Link>
        </div>
    );

    const steps = [
        { status: "PENDING", label: "Confirmed", icon: FaBox },
        { status: "SHIPPED", label: "Shipped", icon: FaTruck },
        { status: "DELIVERED", label: "Delivered", icon: FaCheckCircle },
    ];

    const currentStep = data.shipment
        ? (data.shipment.status === "DELIVERED" ? 2 : data.shipment.status === "SHIPPED" || data.shipment.status === "IN_TRANSIT" ? 1 : 0)
        : 0;
    // If no shipment created yet but order exists => step 0 (Ordered)

    return (
        <div className="container-max page-pad pt-28 md:pt-32 pb-16">
            <div className="mb-8">
                <Link href="/orders" className="text-slate-500 hover:text-[#0b224e] flex items-center gap-2 mb-4">
                    <FaChevronLeft size={12} />
                    Torna ai miei ordini
                </Link>
                <h1 className="text-3xl font-display font-bold text-[#0b224e]">Ordine #{data.order.id.slice(0, 8)}</h1>
                <p className="text-slate-500">
                    Effettuato il {new Date(data.order.createdAt).toLocaleDateString()}
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
                <div className="space-y-6">
                    {/* Tracking Timeline */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                        <h2 className="text-xl font-bold text-[#0b224e] mb-8">Stato Spedizione</h2>

                        <div className="relative flex justify-between">
                            {/* Progress Bar Background */}
                            <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 -z-10" />
                            {/* Active Progress Bar */}
                            <div
                                className="absolute top-5 left-0 h-1 bg-green-500 transition-all duration-500 -z-10"
                                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                            />

                            {steps.map((step, index) => {
                                const isActive = index <= currentStep;
                                const Icon = step.icon;
                                return (
                                    <div key={step.status} className="flex flex-col items-center gap-3 bg-white px-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-200 text-slate-300"
                                            }`}>
                                            <Icon size={16} />
                                        </div>
                                        <span className={`text-sm font-semibold ${isActive ? "text-[#0b224e]" : "text-slate-400"}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {data.shipment && (
                            <div className="mt-8 bg-slate-50 rounded-xl p-6 grid md:grid-cols-2 gap-6">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Corriere</div>
                                    <div className="font-semibold text-[#0b224e]">{data.shipment.carrier || "Non assegnato"}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Codice Tracking</div>
                                    <div className="font-mono text-[#0b224e]">{data.shipment.trackingCode || "-"}</div>
                                </div>
                                {data.shipment.trackingUrl && (
                                    <div className="md:col-span-2">
                                        <a
                                            href={data.shipment.trackingUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#0b224e] underline font-semibold hover:text-blue-600"
                                        >
                                            Vedi tracking sul sito del corriere
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Items */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                        <h2 className="text-xl font-bold text-[#0b224e] mb-6">Articoli</h2>
                        <div className="space-y-4">
                            {data.order.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                                    <div>
                                        <div className="font-semibold text-[#0b224e]">{item.productTitle}</div>
                                        <div className="text-sm text-slate-500">Qty: {item.qty}</div>
                                    </div>
                                    <div className="font-semibold text-[#0b224e]">
                                        €{((item.unitPriceCents * item.qty) / 100).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-lg font-bold text-[#0b224e] mb-4">Indirizzo Spedizione</h2>
                        {data.shippingAddress ? (
                            <div className="text-sm text-slate-600 space-y-1">
                                <div className="font-semibold text-[#0b224e] mb-2">{data.shippingAddress.fullName}</div>
                                <div>{data.shippingAddress.line1}</div>
                                {data.shippingAddress.line2 && <div>{data.shippingAddress.line2}</div>}
                                <div>{data.shippingAddress.postalCode} {data.shippingAddress.city} ({data.shippingAddress.province})</div>
                                <div>{data.shippingAddress.country}</div>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-400 italic">Nessun indirizzo specificato</div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-lg font-bold text-[#0b224e] mb-4">Riepilogo Totale</h2>
                        <div className="flex justify-between items-center text-xl font-bold text-[#0b224e]">
                            <span>Totale</span>
                            <span>€{(data.order.totalCents / 100).toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-2 text-right">
                            IVA Inclusa
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingPage;
