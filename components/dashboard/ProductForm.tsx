"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ImageManager, { type UploadedMedia } from "./ImageManager";

type ProductData = {
    id?: string;
    title: string;
    description: string;
    priceCents: number;
    premiumOnly: boolean;
    pointsEligible: boolean;
    pointsPrice?: number | null;
    specsJson: string;
    category: string;
    isFeatured?: boolean;
    isHero?: boolean;
    isPromo?: boolean;
    isSplit?: boolean;
    isCarousel?: boolean;
    isCollection?: boolean;
    adminTag?: string | null;
    images?: UploadedMedia[]; // Updated type
};

type ProductFormProps = {
    initialData?: ProductData;
    onSubmit: (data: ProductData, files?: File[]) => Promise<ProductData | void>; // Allow returning created product
    onCancel: () => void;
    isSubmitting?: boolean;
    error?: string | null;
    userId?: string; // To scope image uploads if needed directly here or parent handles it
    role: "ADMIN" | "SELLER";
    hideImages?: boolean;
};

const ProductForm = ({ initialData, onSubmit, onCancel, isSubmitting = false, error, role, hideImages = false }: ProductFormProps) => {
    const [form, setForm] = useState<ProductData>({
        title: "",
        description: "",
        priceCents: 0,
        premiumOnly: false,
        pointsEligible: false,
        pointsPrice: null,
        specsJson: '{}',
        category: "OTHER",
        images: [],
        ...initialData
    });

    const [priceInput, setPriceInput] = useState(initialData ? (initialData.priceCents / 100).toString() : "");
    // Images handled separately or via parent? 
    // Ideally parent passes down image handling logic or we embed it here.
    // For simplicity, let's assume image management happens AFTER creation or during edit.
    // But user wants "create with images".
    // Simple flow: Create product first (draft), then show upload area. 
    // OR: If editing, show upload area.
    // Let's stick to: Create basic info -> Returns ID -> Enable image upload.
    // Wait, if we use a single form for both, we handle "Create" mode without images, then switch to "Edit" mode with images.

    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [localSaving, setLocalSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalSaving(true);
        const cents = Math.round(parseFloat(priceInput || "0") * 100);
        try {
            const result = await onSubmit({ ...form, priceCents: cents }, pendingFiles);
            if (result && result.id) {
                setForm(prev => ({ ...prev, ...result }));
            }
        } finally {
            setLocalSaving(false);
        }
    };

    return (
        <div className="glass-panel p-6 md:p-8">
            <h2 className="text-xl font-bold text-[#0b224e] mb-6">
                {form.id ? "Modifica Prodotto" : "Nuovo Prodotto"}
            </h2>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Titolo</label>
                        <input
                            required
                            type="text"
                            className="glass-input w-full"
                            value={form.title}
                            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Nome del prodotto"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Prezzo (€)</label>
                        <input
                            required
                            type="number"
                            step="0.01"
                            min="0"
                            className="glass-input w-full"
                            value={priceInput}
                            onChange={e => setPriceInput(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Categoria</label>
                        <select
                            className="glass-input w-full"
                            value={form.category}
                            onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                        >
                            <option value="ELECTRONICS">Elettronica</option>
                            <option value="HOME">Casa</option>
                            <option value="FASHION">Moda</option>
                            <option value="BEAUTY">Bellezza</option>
                            <option value="SPORTS">Sport</option>
                            <option value="OTHER">Altro</option>
                        </select>
                    </div>
                </div>

                {role === "ADMIN" && (
                    <div className="p-4 bg-yellow-50/50 rounded-xl border border-yellow-100 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isFeatured || false}
                                    onChange={e => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                                    className="w-4 h-4 text-[#0b224e] rounded focus:ring-0"
                                />
                                Featured
                            </label>
                            <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isHero || false}
                                    onChange={e => setForm(prev => ({ ...prev, isHero: e.target.checked }))}
                                    className="w-4 h-4 text-[#0b224e] rounded focus:ring-0"
                                />
                                Hero Carousel
                            </label>
                            <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isPromo || false}
                                    onChange={e => setForm(prev => ({ ...prev, isPromo: e.target.checked }))}
                                    className="w-4 h-4 text-[#0b224e] rounded focus:ring-0"
                                />
                                Promo Grid
                            </label>
                            <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isSplit || false}
                                    onChange={e => setForm(prev => ({ ...prev, isSplit: e.target.checked }))}
                                    className="w-4 h-4 text-[#0b224e] rounded focus:ring-0"
                                />
                                Split Section
                            </label>
                            <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isCarousel || false}
                                    onChange={e => setForm(prev => ({ ...prev, isCarousel: e.target.checked }))}
                                    className="w-4 h-4 text-[#0b224e] rounded focus:ring-0"
                                />
                                Product Carousel
                            </label>
                            <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isCollection || false}
                                    onChange={e => setForm(prev => ({ ...prev, isCollection: e.target.checked }))}
                                    className="w-4 h-4 text-[#0b224e] rounded focus:ring-0"
                                />
                                Collection Grid
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tag Admin (es. HERO, COLLEZIONE_A)</label>
                            <input
                                type="text"
                                className="glass-input w-full py-1 text-sm"
                                value={form.adminTag || ""}
                                onChange={e => setForm(prev => ({ ...prev, adminTag: e.target.value }))}
                                placeholder="Nessun tag"
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Descrizione</label>
                    <textarea
                        required
                        rows={4}
                        className="glass-input w-full"
                        value={form.description}
                        onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrivi il prodotto..."
                    />
                </div>

                <div className="flex flex-wrap gap-6 p-4 bg-white/50 rounded-xl border border-white/60">
                    <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.premiumOnly}
                            onChange={e => setForm(prev => ({ ...prev, premiumOnly: e.target.checked }))}
                            className="w-4 h-4 text-[#0b224e] rounded focus:ring-0"
                        />
                        Solo Premium (Tutela)
                    </label>

                    <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.pointsEligible}
                            onChange={e => setForm(prev => ({ ...prev, pointsEligible: e.target.checked }))}
                            className="w-4 h-4 text-[#0b224e] rounded focus:ring-0"
                        />
                        Acquistabile con Punti
                    </label>

                    {form.pointsEligible && (
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-bold text-slate-700">Costo Punti:</label>
                            <input
                                type="number"
                                className="glass-input w-24 py-1 px-2"
                                value={form.pointsPrice ?? ""}
                                onChange={e => setForm(prev => ({ ...prev, pointsPrice: parseInt(e.target.value) || null }))}
                            />
                        </div>
                    )}
                </div>

                {/* Image Manager Section */}
                {form.id ? (
                    !hideImages && (
                        <div className="mt-8">
                            <ImageManager
                                productId={form.id}
                                initialMedia={form.images}
                                role={role}
                                onMediaChange={(media) => setForm(prev => ({ ...prev, images: media }))}
                            />
                        </div>
                    )
                ) : (
                    <div className="mt-6 p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                        <h3 className="text-sm font-bold text-[#0b224e] mb-2">Immagini del Prodotto</h3>
                        <p className="text-xs text-slate-500 mb-4">Carica subito le immagini principali. La prima sarà la copertina.</p>

                        <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                                const files = e.target.files ? Array.from(e.target.files) : [];
                                setPendingFiles(files);
                            }}
                            className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-slate-100 file:text-[#0b224e]
                                hover:file:bg-slate-200
                            "
                        />
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-100 transition order-2 sm:order-1"
                        disabled={isSubmitting}
                    >
                        {form.id ? "Chiudi" : "Annulla"}
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || localSaving}
                        className="w-full sm:w-auto bg-[#0b224e] text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition disabled:opacity-50 order-1 sm:order-2"
                    >
                        {isSubmitting || localSaving ? "Salvataggio..." : (form.id ? "Aggiorna Dati" : "Crea e procedi")}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
