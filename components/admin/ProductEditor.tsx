"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/dashboard/ProductForm";
import ImageManager from "@/components/dashboard/ImageManager";
import OptionManager from "./OptionManager";
import VariantManager from "./VariantManager";
import { FaBox, FaImages, FaTags, FaCogs, FaArrowLeft, FaListUl, FaEye } from "react-icons/fa";
import { useUI } from "@/context/UIContext";

// Placeholder for ProductSettings (SEO, etc)
const ProductSettings = ({ product }: { product: any }) => {
    return (
        <div className="glass-panel p-6">
            <h3 className="font-bold text-lg mb-4 text-[#0b224e]">Impostazioni Avanzate</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Slug URL</label>
                    <input type="text" className="glass-input w-full bg-slate-50" value={product.slug || ""} readOnly />
                    <p className="text-[10px] text-slate-400 mt-1 uppercase">Generato automaticamente dal titolo per l'indicizzazione.</p>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Brand</label>
                    <input type="text" className="glass-input w-full" defaultValue={product.brand || ""} />
                </div>
            </div>
        </div>
    );
};

export default function ProductEditor({ product, currentUser }: { product: any, currentUser: any }) {
    const router = useRouter();
    const { showToast, confirm } = useUI();

    const isAdmin = currentUser.role === "ADMIN";
    const apiBase = isAdmin ? `/api/admin/products/${product.id}` : `/api/seller/products/${product.id}`;

    const handleUpdate = async (data: any) => {
        try {
            const res = await fetch(apiBase, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Errore aggiornamento");
            showToast("Modifiche salvate con successo", "success");
            router.refresh();
            return await res.json().then((r: any) => r.product);
        } catch (err) {
            showToast("Errore durante il salvataggio", "error");
        }
    };

    const handleSaveOptions = async (options: any[]) => {
        const res = await fetch(`${apiBase}/options`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ options })
        });
        if (!res.ok) throw new Error("Failed to save options");
        showToast("Opzioni salvate", "success");
        router.refresh();
    };

    const handleGenerateVariants = async () => {
        const res = await fetch(`${apiBase}/variants/generate`, {
            method: "POST"
        });
        if (!res.ok) throw new Error("Failed to generate variants");
        showToast("Varianti generate con successo", "success");
        router.refresh();
    };

    const handleSaveVariant = async (variant: any) => {
        const res = await fetch(`${apiBase}/variants/${variant.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(variant)
        });
        if (!res.ok) throw new Error("Failed to update variant");
        showToast("Variante aggiornata", "success");
        router.refresh();
    };

    const handleDeleteVariant = async (variantId: string) => {
        const confirmed = await confirm({
            title: "Elimina Variante",
            message: "Sei sicuro di voler eliminare questa variante?",
            confirmText: "Elimina",
            variant: "danger"
        });
        if (!confirmed) return;

        const res = await fetch(`${apiBase}/variants/${variantId}`, {
            method: "DELETE"
        });
        if (!res.ok) throw new Error("Failed to delete variant");
        showToast("Variante eliminata", "success");
        router.refresh();
    };

    const handleApprove = async () => {
        const confirmed = await confirm({
            title: "Approva Prodotto",
            message: "Sei sicuro di voler approvare e pubblicare questo prodotto?",
            confirmText: "Approva",
            variant: "primary"
        });
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/products/${product.id}/approve`, { method: "POST" });
            if (!res.ok) throw new Error("Errore durante l'approvazione");
            showToast("Prodotto approvato con successo!", "success");
            router.refresh();
        } catch (err) {
            showToast("Errore durante l'approvazione", "error");
        }
    };

    const handleReject = async () => {
        const note = await confirm({
            title: "Rifiuta Prodotto",
            message: "Indica la motivazione del rifiuto per aiutare il seller a correggere il prodotto.",
            confirmText: "Rifiuta",
            variant: "danger",
            showPrompt: true,
            promptPlaceholder: "Motivazione del rifiuto..."
        });

        if (note === false) return;

        try {
            const res = await fetch(`/api/admin/products/${product.id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note })
            });
            if (!res.ok) throw new Error("Errore durante il rifiuto");
            showToast("Prodotto rifiutato", "info");
            router.refresh();
        } catch (err) {
            showToast("Errore durante il rifiuto", "error");
        }
    };


    return (
        <div className="container-max page-pad py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                    <Link href={isAdmin ? "/admin/products" : "/seller/products"} className="p-2 rounded-full hover:bg-slate-100 transition text-slate-400 shrink-0">
                        <FaArrowLeft />
                    </Link>
                    <div className="min-w-0">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl md:text-2xl font-bold text-[#0b224e] truncate">{product.title}</h1>
                            <Link
                                href={`/product/${product.id}`}
                                target="_blank"
                                className="px-3 py-1 bg-slate-100 text-[#0b224e] text-xs font-bold rounded-full hover:bg-slate-200 transition flex items-center gap-1 shrink-0"
                            >
                                <FaEye size={12} /> Anteprima
                            </Link>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto no-scrollbar">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] md:text-[10px] uppercase font-bold whitespace-nowrap ${product.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                product.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-slate-100 text-slate-600"
                                }`}>
                                {product.status}
                            </span>
                            <span className="shrink-0">•</span>
                            <span className="font-medium uppercase tracking-wider whitespace-nowrap">{product.category}</span>
                        </div>
                    </div>
                </div>

                {!isAdmin && (product.status === "DRAFT" || product.status === "REJECTED") && (
                    <button
                        onClick={async () => {
                            const confirmed = await confirm({
                                title: "Invia per Revisione",
                                message: "Vuoi inviare il prodotto per la revisione? Una volta inviato non potrai modificarlo finché non viene revisionato.",
                                confirmText: "Invia",
                                variant: "primary"
                            });
                            if (!confirmed) return;

                            const res = await fetch(`/api/seller/products/${product.id}/submit`, { method: "POST" });
                            if (res.ok) {
                                showToast("Inviato con successo!", "success");
                                router.refresh();
                            } else {
                                showToast("Errore durante l'invio.", "error");
                            }
                        }}
                        className="bg-[#0b224e] text-white px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition w-full md:w-auto text-sm"
                    >
                        Invia per Revisione
                    </button>
                )}

                {isAdmin && (
                    <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                        {product.status !== "REJECTED" && (
                            <button
                                onClick={handleReject}
                                className="flex-1 md:flex-none bg-white border-2 border-[#a41f2e] text-[#a41f2e] px-4 md:px-6 py-2 rounded-full font-bold hover:bg-red-50 transition text-sm md:text-base whitespace-nowrap"
                            >
                                {product.status === "APPROVED" ? "Sospendi" : "Rifiuta"}
                            </button>
                        )}
                        {product.status !== "APPROVED" && (
                            <button
                                onClick={handleApprove}
                                className="flex-1 md:flex-none bg-green-600 text-white px-4 md:px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition text-sm md:text-base whitespace-nowrap"
                            >
                                {product.status === "REJECTED" ? "Ripristina" : "Approva"}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Nav */}
            <div className="sticky top-20 z-40 mb-8 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 bg-white/80 backdrop-blur-md border-b border-slate-100 hidden md:block">
                <div className="flex gap-4 min-w-max">
                    {[
                        { id: "info", label: "Informazioni", icon: <FaBox className="text-blue-500" /> },
                        { id: "options", label: "Opzioni", icon: <FaListUl className="text-orange-500" /> },
                        { id: "media", label: "Media", icon: <FaImages className="text-purple-500" /> },
                        { id: "variants", label: "Varianti & Stock", icon: <FaTags className="text-green-500" /> },
                        { id: "settings", label: "Impostazioni", icon: <FaCogs className="text-slate-500" /> },
                    ].map(nav => (
                        <a
                            key={nav.id}
                            href={`#${nav.id}`}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 text-xs font-bold text-[#0b224e] hover:bg-slate-50 shadow-sm transition-all"
                        >
                            {nav.icon} {nav.label}
                        </a>
                    ))}
                </div>
            </div>

            {/* Unified Content */}
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* 1. Main Info and Media */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Info Section */}
                        <section id="info" className="glass-panel p-0 overflow-hidden">
                            <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-200">
                                <h3 className="font-bold text-[#0b224e] flex items-center gap-2">
                                    <FaBox className="text-blue-500" /> Informazioni Generali
                                </h3>
                            </div>
                            <div className="p-6">
                                <ProductForm
                                    initialData={product}
                                    onSubmit={handleUpdate}
                                    onCancel={() => router.push(isAdmin ? "/admin/products" : "/seller/products")}
                                    role={currentUser.role}
                                    hideImages={true}
                                />
                            </div>
                        </section>

                        {/* Options Section */}
                        <section id="options" className="glass-panel p-0 overflow-hidden">
                            <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-200">
                                <h3 className="font-bold text-[#0b224e] flex items-center gap-2">
                                    <FaListUl className="text-orange-500" /> Configurazione Varianti (Opzioni)
                                </h3>
                            </div>
                            <div className="p-6">
                                <OptionManager
                                    productId={product.id}
                                    initialOptions={product.options || []}
                                    onSave={handleSaveOptions}
                                />
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        {/* Media Section */}
                        <section id="media" className="glass-panel p-0 overflow-hidden">
                            <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-200">
                                <h3 className="font-bold text-[#0b224e] flex items-center gap-2">
                                    <FaImages className="text-purple-500" /> Galleria Media
                                </h3>
                            </div>
                            <div className="p-6">
                                <p className="text-xs text-slate-500 mb-4">La prima immagine sarà la copertina del prodotto.</p>
                                <ImageManager productId={product.id} initialMedia={product.media} role={currentUser.role} />
                            </div>
                        </section>

                        {/* Settings / SEO Section */}
                        <section id="settings" className="glass-panel p-0 overflow-hidden">
                            <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-200">
                                <h3 className="font-bold text-[#0b224e] flex items-center gap-2">
                                    <FaCogs className="text-slate-500" /> Impostazioni e SEO
                                </h3>
                            </div>
                            <div className="p-6">
                                <ProductSettings product={product} />
                            </div>
                        </section>
                    </div>
                </div>

                {/* 2. Variants List */}
                <section id="variants" className="glass-panel p-0 overflow-hidden">
                    <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-200">
                        <h3 className="font-bold text-[#0b224e] flex items-center gap-2">
                            <FaTags className="text-green-500" /> Gestione Stock e Varianti ({product.variants?.length || 0})
                        </h3>
                    </div>
                    <div className="p-0">
                        <VariantManager
                            productId={product.id}
                            variants={product.variants || []}
                            options={product.options || []}
                            media={product.media || []}
                            onSaveVariant={handleSaveVariant}
                            onDeleteVariant={handleDeleteVariant}
                            onGenerateVariants={handleGenerateVariants}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}
