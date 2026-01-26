"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { FaFileAlt } from "react-icons/fa";

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

export default function InvoicesPage() {
    const { user } = useUser();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async (startingAfter?: string) => {
        try {
            const isLoadingMore = Boolean(startingAfter);
            if (isLoadingMore) setLoadingMore(true);

            const url = startingAfter
                ? `/api/membership/invoices?limit=20&starting_after=${startingAfter}`
                : `/api/membership/invoices?limit=20`;

            const res = await fetch(url, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                if (isLoadingMore) {
                    setInvoices(prev => [...prev, ...data.invoices]);
                } else {
                    setInvoices(data.invoices ?? []);
                }
                setHasMore(data.hasMore);
            }
        } catch (error) {
            console.error("Failed to load invoices:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
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

    return (
        <div className="container-max page-pad pt-28 md:pt-32 pb-20">
            <div className="mb-10">
                <Link href="/billing" className="text-sm text-slate-500 hover:text-[#0b224e] mb-4 inline-block">
                    ← Torna alla fatturazione
                </Link>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e]">Storico fatture</h1>
                <p className="text-slate-500 mt-2">Visualizza e scarica le tue fatture.</p>
            </div>

            {loading ? (
                <div className="glass-panel p-8 text-center text-slate-500">Caricamento fatture...</div>
            ) : invoices.length === 0 ? (
                <div className="glass-card card-pad text-center">
                    <FaFileAlt className="text-6xl text-[#0b224e] mx-auto mb-4" />
                    <p className="text-slate-500">Nessuna fattura disponibile.</p>
                </div>
            ) : (
                <div className="glass-card card-pad">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                    <th className="pb-3 font-bold">Numero</th>
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
                                        <td className="py-4 font-mono text-xs text-slate-600">
                                            {invoice.number || "-"}
                                        </td>
                                        <td className="py-4 font-medium text-slate-700">{formatDate(invoice.createdAt)}</td>
                                        <td className="py-4 text-slate-600">{invoice.description}</td>
                                        <td className="py-4 font-bold text-slate-700">
                                            {formatCurrency(invoice.amountPaid, invoice.currency)}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${invoice.status === "paid"
                                                ? "bg-green-100 text-green-700"
                                                : invoice.status === "open"
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-slate-100 text-slate-600"
                                                }`}>
                                                {invoice.status === "paid" ? "Pagato" :
                                                    invoice.status === "open" ? "In attesa" :
                                                        invoice.status || "-"}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right space-x-4">
                                            {invoice.hostedInvoiceUrl && (
                                                <a
                                                    href={invoice.hostedInvoiceUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#0b224e] font-bold hover:underline"
                                                >
                                                    Visualizza
                                                </a>
                                            )}
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

                    {hasMore && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => loadInvoices(invoices[invoices.length - 1]?.id)}
                                disabled={loadingMore}
                                className="px-6 py-2.5 text-sm font-bold text-[#0b224e] border border-[#0b224e] rounded-full hover:bg-[#0b224e] hover:text-white transition disabled:opacity-50"
                            >
                                {loadingMore ? "Caricamento..." : "Carica altre fatture"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
