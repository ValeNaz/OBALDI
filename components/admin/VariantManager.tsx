"use client";

import { useState } from "react";
import { FaSync, FaTrash, FaEdit, FaSave, FaTimes, FaBox } from "react-icons/fa";

type Variant = {
    id: string;
    title: string;
    sku: string | null;
    priceCents: number | null;
    stockQty: number;
    attributesJson: any;
    mediaIndex: number | null;
};

type Option = {
    name: string;
    values: string[];
};

type VariantManagerProps = {
    productId: string;
    variants: Variant[];
    options: Option[];
    media: { url: string }[];
    onSaveVariant: (variant: Partial<Variant>) => Promise<void>;
    onDeleteVariant: (id: string) => Promise<void>;
    onGenerateVariants: () => Promise<void>;
};

import { useUI } from "@/context/UIContext";

export default function VariantManager({
    productId,
    variants,
    options,
    media,
    onSaveVariant,
    onDeleteVariant,
    onGenerateVariants
}: VariantManagerProps) {
    const { showToast, confirm } = useUI();
    const [generating, setGenerating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Variant>>({});

    const handleGenerate = async () => {
        if (options.length === 0) {
            showToast("Definisci prima le opzioni nella scheda 'Opzioni'.", "error");
            return;
        }
        if (variants.length > 0) {
            const confirmed = await confirm({
                title: "Rigenera Varianti",
                message: "Tutte le varianti esistenti verranno mantenute. Verranno generate solo quelle mancanti. Continuare?",
                confirmText: "Continua",
                variant: "primary"
            });
            if (!confirmed) return;
        }

        setGenerating(true);
        try {
            await onGenerateVariants();
            showToast("Varianti generate correttamente!", "success");
        } catch (err) {
            showToast("Errore durante la generazione.", "error");
        } finally {
            setGenerating(false);
        }
    };

    const startEdit = (v: Variant) => {
        setEditingId(v.id);
        setEditForm({ ...v });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = async () => {
        if (!editingId) return;
        try {
            await onSaveVariant(editForm);
            setEditingId(null);
            showToast("Variante aggiornata!", "success");
        } catch (err) {
            showToast("Errore durante l'aggiornamento.", "error");
        }
    };

    return (
        <div className="glass-panel p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="font-bold text-lg text-[#0b224e]">Varianti Prodotto</h3>
                    <p className="text-sm text-slate-500">Gestisci stock, SKU e prezzi.</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0b224e] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-900 transition disabled:opacity-50 shadow-md"
                >
                    <FaSync className={generating ? "animate-spin" : ""} />
                    {generating ? "Generazione..." : "Genera Varianti"}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                        <tr>
                            <th className="px-4 py-3">Variante</th>
                            <th className="px-4 py-3 hidden md:table-cell">Immagine</th>
                            <th className="px-4 py-3 hidden lg:table-cell">SKU</th>
                            <th className="px-4 py-3 hidden sm:table-cell">Prezzo</th>
                            <th className="px-4 py-3">Stock</th>
                            <th className="px-4 py-3 text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {variants.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                    Nessuna variante generata. Clicca su "Genera Varianti" per iniziare.
                                </td>
                            </tr>
                        ) : (
                            variants.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50/50 transition">
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-[#0b224e]">{v.title}</div>
                                        <div className="text-[10px] text-slate-400">
                                            {Object.entries(v.attributesJson as object).map(([k, val]) => `${k}: ${val}`).join(", ")}
                                        </div>
                                        {/* Mobile visible price/sku fallback */}
                                        <div className="sm:hidden mt-1 text-[10px] space-x-2">
                                            {v.priceCents && <span className="font-bold text-[#0b224e]">€{(v.priceCents / 100).toFixed(2)}</span>}
                                            {v.sku && <span className="text-slate-400">SKU: {v.sku}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        {editingId === v.id ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex flex-wrap gap-1 max-w-[150px] p-2 bg-slate-50 border border-slate-200 rounded-lg">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditForm(prev => ({ ...prev, mediaIndex: null }))}
                                                        className={`w-8 h-8 rounded border flex items-center justify-center text-[10px] transition ${editForm.mediaIndex === null ? "border-blue-500 bg-blue-50 text-blue-600 font-bold" : "border-slate-200 bg-white text-slate-400"}`}
                                                        title="Nessuna immagine"
                                                    >
                                                        X
                                                    </button>
                                                    {media.map((m, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => setEditForm(prev => ({ ...prev, mediaIndex: idx }))}
                                                            className={`w-8 h-8 rounded border overflow-hidden transition relative ${editForm.mediaIndex === idx ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200 opacity-60 hover:opacity-100"}`}
                                                        >
                                                            <img src={m.url} className="w-full h-full object-cover" alt="" />
                                                            {editForm.mediaIndex === idx && (
                                                                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                                                    <div className="bg-blue-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[8px]">✓</div>
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] text-slate-400">Seleziona immagine variante</span>
                                            </div>
                                        ) : (
                                            v.mediaIndex !== null && v.mediaIndex !== undefined && media[v.mediaIndex] ? (
                                                <img src={media[v.mediaIndex].url} className="w-10 h-10 object-cover rounded shadow-sm border border-white" alt="Variant" />
                                            ) : (
                                                <div className="w-10 h-10 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300">
                                                    <FaBox size={14} />
                                                </div>
                                            )
                                        )}
                                    </td>
                                    <td className="px-4 py-4 hidden lg:table-cell">
                                        {editingId === v.id ? (
                                            <input
                                                type="text"
                                                className="glass-input py-1 px-2 text-xs w-24"
                                                value={editForm.sku || ""}
                                                onChange={e => setEditForm(prev => ({ ...prev, sku: e.target.value }))}
                                            />
                                        ) : (
                                            <span className="text-slate-500 font-mono text-xs">{v.sku || "-"}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 hidden sm:table-cell">
                                        {editingId === v.id ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="glass-input py-1 px-2 text-xs w-20"
                                                value={editForm.priceCents ? (editForm.priceCents / 100).toString() : ""}
                                                onChange={e => setEditForm(prev => ({ ...prev, priceCents: Math.round(parseFloat(e.target.value || "0") * 100) || null }))}
                                                placeholder="Prezzo base"
                                            />
                                        ) : (
                                            <span className="font-bold">
                                                {v.priceCents ? `€${(v.priceCents / 100).toFixed(2)}` : "Default"}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {editingId === v.id ? (
                                            <input
                                                type="number"
                                                className="glass-input py-1 px-2 text-xs w-16"
                                                value={editForm.stockQty || 0}
                                                onChange={e => setEditForm(prev => ({ ...prev, stockQty: parseInt(e.target.value) || 0 }))}
                                            />
                                        ) : (
                                            <span className={`font-bold ${v.stockQty <= 5 ? "text-red-500" : "text-slate-700"}`}>
                                                {v.stockQty}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        {editingId === v.id ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={saveEdit} className="text-green-600 hover:text-green-800" title="Salva"><FaSave /></button>
                                                <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600" title="Annulla"><FaTimes /></button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => startEdit(v)} className="text-slate-400 hover:text-blue-600" title="Modifica"><FaEdit /></button>
                                                <button onClick={() => onDeleteVariant(v.id)} className="text-slate-300 hover:text-red-500" title="Elimina"><FaTrash size={12} /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
