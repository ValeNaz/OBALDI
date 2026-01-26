"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { FaClipboardList, FaCreditCard } from "react-icons/fa";

type BillingData = {
    membership: {
        id: string;
        status: string;
        autoRenew: boolean;
        currentPeriodStart: string;
        currentPeriodEnd: string;
    };
    plan: {
        code: string;
        priceCents: number;
        currency: string;
        periodDays: number;
    };
    subscription: {
        id: string;
        status: string;
        cancelAtPeriodEnd: boolean;
        currentPeriodEnd: string;
    };
    customerId: string;
    paymentMethod: {
        type: string;
        last4?: string;
        brand?: string;
        expMonth?: number;
        expYear?: number;
    } | null;
};

type Invoice = {
    id: string;
    number: string | null;
    status: string | null;
    amountDue: number;
    amountPaid: number;
    currency: string;
    createdAt: string;
    paidAt: string | null;
    hostedInvoiceUrl: string | null;
    invoicePdf: string | null;
    description: string;
};

export default function BillingPage() {
    const { user, refresh } = useUser();
    const [billing, setBilling] = useState<BillingData | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);

    useEffect(() => {
        loadBillingData();
    }, []);

    const loadBillingData = async () => {
        try {
            const [billingRes, invoicesRes] = await Promise.all([
                fetch("/api/membership/billing", { credentials: "include" }),
                fetch("/api/membership/invoices?limit=5", { credentials: "include" })
            ]);

            if (billingRes.ok) {
                setBilling(await billingRes.json());
            } else if (billingRes.status === 404) {
                setError("no_membership");
            } else {
                setError("Impossibile caricare i dati di fatturazione.");
            }

            if (invoicesRes.ok) {
                const data = await invoicesRes.json();
                setInvoices(data.invoices ?? []);
            }
        } catch {
            setError("Errore di connessione.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (immediate: boolean) => {
        setActionLoading("cancel");
        try {
            const res = await fetch("/api/membership/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ immediate }),
                credentials: "include"
            });

            if (res.ok) {
                await loadBillingData();
                await refresh();
                setShowCancelModal(false);
            } else {
                const data = await res.json();
                alert(data.error?.message || "Errore durante la cancellazione.");
            }
        } catch {
            alert("Errore di connessione.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleResume = async () => {
        setActionLoading("resume");
        try {
            const res = await fetch("/api/membership/cancel", { method: "DELETE", credentials: "include" });
            if (res.ok) {
                await loadBillingData();
                await refresh();
            } else {
                const data = await res.json();
                alert(data.error?.message || "Errore durante il ripristino.");
            }
        } catch {
            alert("Errore di connessione.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleChangePlan = async (planCode: "ACCESSO" | "TUTELA") => {
        setActionLoading("plan");
        try {
            const res = await fetch("/api/membership/change-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planCode }),
                credentials: "include"
            });

            if (res.ok) {
                await loadBillingData();
                await refresh();
                setShowPlanModal(false);
            } else {
                const data = await res.json();
                alert(data.error?.message || "Errore durante il cambio piano.");
            }
        } catch {
            alert("Errore di connessione.");
        } finally {
            setActionLoading(null);
        }
    };

    const handlePortal = async () => {
        setActionLoading("portal");
        try {
            const res = await fetch("/api/membership/portal", { method: "POST", credentials: "include" });
            if (res.ok) {
                const { url } = await res.json();
                window.location.href = url;
            } else {
                const data = await res.json();
                alert(data.error?.message || "Errore nell'apertura del portale.");
            }
        } catch {
            alert("Errore di connessione.");
        } finally {
            setActionLoading(null);
        }
    };

    const formatCurrency = (cents: number, currency: string) => {
        return new Intl.NumberFormat("it-IT", {
            style: "currency",
            currency: currency.toUpperCase()
        }).format(cents / 100);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("it-IT", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    if (!user) {
        return (
            <div className="container-max page-pad pt-28 md:pt-32 pb-20">
                <div className="glass-panel p-8 text-center">
                    <p className="text-sm text-slate-600">Devi effettuare l'accesso.</p>
                    <Link href="/login" className="mt-4 inline-block text-sm font-bold text-[#0b224e]">
                        Vai al login
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container-max page-pad pt-28 md:pt-32 pb-20">
                <div className="glass-panel p-8 text-center text-slate-500">
                    Caricamento dati di fatturazione...
                </div>
            </div>
        );
    }

    if (error === "no_membership") {
        return (
            <div className="container-max page-pad pt-28 md:pt-32 pb-20">
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e]">Fatturazione</h1>
                </div>
                <div className="glass-card card-pad text-center">
                    <FaClipboardList className="text-6xl text-[#0b224e] mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-700 mb-2">Nessun abbonamento attivo</h2>
                    <p className="text-slate-500 mb-6">Attiva una membership per accedere a tutti i vantaggi.</p>
                    <Link
                        href="/membership"
                        className="inline-flex px-8 py-3 bg-[#0b224e] text-white rounded-full font-bold hover:shadow-glow-soft transition"
                    >
                        Diventa membro →
                    </Link>
                </div>
            </div>
        );
    }

    if (!billing) {
        return (
            <div className="container-max page-pad pt-28 md:pt-32 pb-20">
                <div className="glass-panel p-8 text-center text-red-600">{error}</div>
            </div>
        );
    }

    const planNames: Record<string, string> = {
        ACCESSO: "Accesso",
        TUTELA: "Tutela Premium"
    };

    const otherPlan = billing.plan.code === "ACCESSO" ? "TUTELA" : "ACCESSO";

    return (
        <div className="container-max page-pad pt-28 md:pt-32 pb-20">
            <div className="mb-10">
                <Link href="/profile" className="text-sm text-slate-500 hover:text-[#0b224e] mb-4 inline-block">
                    ← Torna al profilo
                </Link>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e]">Fatturazione</h1>
                <p className="text-slate-500 mt-2">Gestisci il tuo abbonamento e i metodi di pagamento.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Current Plan */}
                <div className="glass-card card-pad lg:col-span-2">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-[#0b224e]">Piano attuale</h2>
                            <p className="text-3xl font-black text-slate-800 mt-2">
                                {planNames[billing.plan.code] || billing.plan.code}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-[#0b224e]">
                                {formatCurrency(billing.plan.priceCents, billing.plan.currency)}
                            </p>
                            <p className="text-sm text-slate-500">ogni {billing.plan.periodDays} giorni</p>
                        </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${billing.membership.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : billing.membership.status === "PAST_DUE"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                            {billing.membership.status === "ACTIVE" ? "Attivo" :
                                billing.membership.status === "PAST_DUE" ? "Pagamento in sospeso" :
                                    "Cancellato"}
                        </span>
                        {billing.subscription.cancelAtPeriodEnd && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                Si disattiverà il {formatDate(billing.subscription.currentPeriodEnd)}
                            </span>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Prossimo rinnovo</p>
                            <p className="font-semibold text-slate-700">{formatDate(billing.membership.currentPeriodEnd)}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Rinnovo automatico</p>
                            <p className="font-semibold text-slate-700">{billing.membership.autoRenew ? "Attivo" : "Disattivato"}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-slate-100">
                        <button
                            onClick={() => setShowPlanModal(true)}
                            className="px-6 py-2.5 bg-[#0b224e] text-white rounded-full font-bold text-sm hover:shadow-glow-soft transition"
                        >
                            {billing.plan.code === "ACCESSO" ? "Passa a Tutela Premium" : "Cambia piano"}
                        </button>
                        {billing.subscription.cancelAtPeriodEnd ? (
                            <button
                                onClick={handleResume}
                                disabled={actionLoading === "resume"}
                                className="px-6 py-2.5 bg-green-600 text-white rounded-full font-bold text-sm hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {actionLoading === "resume" ? "..." : "Riattiva abbonamento"}
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="px-6 py-2.5 text-red-600 hover:bg-red-50 rounded-full font-bold text-sm transition"
                            >
                                Cancella abbonamento
                            </button>
                        )}
                    </div>
                </div>

                {/* Payment Method */}
                <div className="glass-card card-pad">
                    <h2 className="text-xl font-bold text-[#0b224e] mb-4">Metodo di pagamento</h2>
                    {billing.paymentMethod ? (
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                            <FaCreditCard className="text-3xl text-[#0b224e]" />
                            <div>
                                <p className="font-bold text-slate-700 capitalize">
                                    {billing.paymentMethod.brand} •••• {billing.paymentMethod.last4}
                                </p>
                                <p className="text-sm text-slate-500">
                                    Scade {billing.paymentMethod.expMonth}/{billing.paymentMethod.expYear}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">Nessun metodo di pagamento salvato.</p>
                    )}
                    <button
                        onClick={handlePortal}
                        disabled={actionLoading === "portal"}
                        className="mt-4 w-full px-4 py-2.5 text-sm font-bold text-[#0b224e] border border-[#0b224e] rounded-full hover:bg-[#0b224e] hover:text-white transition disabled:opacity-50"
                    >
                        {actionLoading === "portal" ? "Apertura..." : "Gestisci metodi di pagamento"}
                    </button>
                </div>

                {/* Invoices */}
                <div className="glass-card card-pad lg:col-span-3">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-[#0b224e]">Storico pagamenti</h2>
                        <Link href="/billing/invoices" className="text-sm font-bold text-[#0b224e] hover:underline">
                            Vedi tutti →
                        </Link>
                    </div>

                    {invoices.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">Nessun pagamento registrato.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                        <th className="pb-3 font-bold">Data</th>
                                        <th className="pb-3 font-bold">Descrizione</th>
                                        <th className="pb-3 font-bold">Importo</th>
                                        <th className="pb-3 font-bold">Stato</th>
                                        <th className="pb-3 font-bold text-right">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                            <td className="py-4 font-medium text-slate-700">{formatDate(invoice.createdAt)}</td>
                                            <td className="py-4 text-slate-600">{invoice.description}</td>
                                            <td className="py-4 font-bold text-slate-700">
                                                {formatCurrency(invoice.amountPaid, invoice.currency)}
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${invoice.status === "paid"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-amber-100 text-amber-700"
                                                    }`}>
                                                    {invoice.status === "paid" ? "Pagato" : invoice.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                {invoice.invoicePdf && (
                                                    <a
                                                        href={invoice.invoicePdf}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#0b224e] font-bold hover:underline"
                                                    >
                                                        PDF
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Cancella abbonamento</h3>
                        <p className="text-slate-600 mb-6">
                            Sei sicuro di voler cancellare il tuo abbonamento? Potrai comunque utilizzare i servizi fino alla fine del periodo corrente.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleCancel(false)}
                                disabled={actionLoading === "cancel"}
                                className="w-full py-3 bg-amber-500 text-white rounded-full font-bold hover:bg-amber-600 transition disabled:opacity-50"
                            >
                                {actionLoading === "cancel" ? "..." : "Cancella alla fine del periodo"}
                            </button>
                            <button
                                onClick={() => handleCancel(true)}
                                disabled={actionLoading === "cancel"}
                                className="w-full py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition disabled:opacity-50"
                            >
                                Cancella subito
                            </button>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="w-full py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-full transition"
                            >
                                Annulla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Change Modal */}
            {showPlanModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Cambia piano</h3>
                        <div className="space-y-4 mb-6">
                            <div className={`p-4 rounded-xl border-2 ${otherPlan === "TUTELA" ? "border-[#0b224e] bg-[#0b224e]/5" : "border-slate-200"
                                }`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{planNames[otherPlan]}</h4>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {otherPlan === "TUTELA"
                                                ? "Tutti i vantaggi + Assistenza acquisti + Punti extra"
                                                : "Accesso base al marketplace"}
                                        </p>
                                    </div>
                                    <span className="font-bold text-[#0b224e]">
                                        {otherPlan === "TUTELA" ? "€9,90" : "€4,90"}/mese
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleChangePlan(otherPlan as "ACCESSO" | "TUTELA")}
                                disabled={actionLoading === "plan"}
                                className="w-full py-3 bg-[#0b224e] text-white rounded-full font-bold hover:shadow-glow-soft transition disabled:opacity-50"
                            >
                                {actionLoading === "plan" ? "..." : `Passa a ${planNames[otherPlan]}`}
                            </button>
                            <button
                                onClick={() => setShowPlanModal(false)}
                                className="w-full py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-full transition"
                            >
                                Annulla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
