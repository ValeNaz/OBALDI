"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/dashboard/ProductForm";
import ImageManager from "@/components/dashboard/ImageManager";
import OptionManager from "./OptionManager";
import VariantManager from "./VariantManager";
import { FaBox, FaImages, FaTags, FaCogs, FaArrowLeft, FaListUl } from "react-icons/fa";

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
    const [activeTab, setActiveTab] = useState<"info" | "options" | "variants" | "media" | "settings">("info");

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
            router.refresh();
            return await res.json().then((r: any) => r.product);
        } catch (err) {
            alert("Errore salvataggio");
        }
    };

    const handleSaveOptions = async (options: any[]) => {
        const res = await fetch(`${apiBase}/options`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ options })
        });
        if (!res.ok) throw new Error("Failed to save options");
        router.refresh();
    };

    const handleGenerateVariants = async () => {
        const res = await fetch(`${apiBase}/variants/generate`, {
            method: "POST"
        });
        if (!res.ok) throw new Error("Failed to generate variants");
        router.refresh();
    };

    const handleSaveVariant = async (variant: any) => {
        const res = await fetch(`${apiBase}/variants/${variant.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(variant)
        });
        if (!res.ok) throw new Error("Failed to update variant");
        router.refresh();
    };

    const handleDeleteVariant = async (variantId: string) => {
        if (!confirm("Sei sicuro di voler eliminare questa variante?")) return;
        const res = await fetch(`${apiBase}/variants/${variantId}`, {
            method: "DELETE"
        });
        if (!res.ok) throw new Error("Failed to delete variant");
        router.refresh();
    };

    return (
        <div className="container-max page-pad py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <Link href={isAdmin ? "/admin/products" : "/seller/products"} className="p-2 rounded-full hover:bg-slate-100 transition text-slate-400">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[#0b224e]">{product.title}</h1>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${product.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                product.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-slate-100 text-slate-600"
                                }`}>
                                {product.status}
                            </span>
                            <span>•</span>
                            <span className="font-medium text-xs uppercase tracking-wider">{product.category}</span>
                        </div>
                    </div>
                </div>

                {!isAdmin && (product.status === "DRAFT" || product.status === "REJECTED") && (
                    <button
                        onClick={async () => {
                            if (!confirm("Inviare il prodotto per la revisione?")) return;
                            const res = await fetch(`/api/seller/products/${product.id}/submit`, { method: "POST" });
                            if (res.ok) {
                                alert("Inviato con successo!");
                                router.refresh();
                            } else {
                                alert("Errore durante l'invio.");
                            }
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition"
                    >
                        Invia per Revisione
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 mb-8 border-b border-slate-200 no-scrollbar">
                {[
                    { id: "info", label: "Informazioni", icon: FaBox },
                    { id: "options", label: "Opzioni", icon: FaListUl },
                    { id: "variants", label: "Varianti", count: product.variants?.length, icon: FaTags },
                    { id: "media", label: "Media", icon: FaImages },
                    { id: "settings", label: "Impostazioni", icon: FaCogs },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 font-bold transition whitespace-nowrap border-b-2 ${activeTab === tab.id
                            ? "text-[#0b224e] border-[#0b224e]"
                            : "text-slate-400 border-transparent hover:text-slate-600"
                            }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-[#0b224e] text-white" : "bg-slate-100 text-slate-500"}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[500px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === "info" && (
                    <ProductForm
                        initialData={product}
                        onSubmit={handleUpdate}
                        onCancel={() => router.push(isAdmin ? "/admin/products" : "/seller/products")}
                        role={currentUser.role}
                        hideImages={true}
                    />
                )}
                {activeTab === "options" && (
                    <OptionManager
                        productId={product.id}
                        initialOptions={product.options || []}
                        onSave={handleSaveOptions}
                    />
                )}
                {activeTab === "variants" && (
                    <VariantManager
                        productId={product.id}
                        variants={product.variants || []}
                        options={product.options || []}
                        media={product.media || []}
                        onSaveVariant={handleSaveVariant}
                        onDeleteVariant={handleDeleteVariant}
                        onGenerateVariants={handleGenerateVariants}
                    />
                )}
                {activeTab === "media" && (
                    <div className="glass-panel p-8">
                        <div className="mb-6">
                            <h3 className="font-bold text-lg text-[#0b224e]">Galleria Media</h3>
                            <p className="text-sm text-slate-500">Trascina le immagini per ordinarle. La prima immagine sarà quella principale.</p>
                        </div>
                        <ImageManager productId={product.id} initialMedia={product.media} role={currentUser.role} />
                    </div>
                )}
                {activeTab === "settings" && <ProductSettings product={product} />}
            </div>
        </div>
    );
}
