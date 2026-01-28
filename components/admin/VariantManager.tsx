"use client";

import { useState } from "react";
import { FaSync, FaTrash, FaEdit, FaSave, FaTimes } from "react-icons/fa";

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

export default function VariantManager({
    productId,
    variants,
    options,
    media,
    onSaveVariant,
    onDeleteVariant,
    onGenerateVariants
}: VariantManagerProps) {
    const [generating, setGenerating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Variant>>({});

    const handleGenerate = async () => {
        if (options.length === 0) {
            alert("Definisci prima le opzioni nella scheda 'Opzioni'.");
            return;
        }
        if (variants.length > 0) {
            if (!confirm("Tutte le varianti esistenti verranno mantenute. Verranno generate solo quelle mancanti. Continuare?")) return;
        }

        setGenerating(true);
        try {
            await onGenerateVariants();
            alert("Varianti generate correttamente!");
        } catch (err) {
            alert("Errore durante la generazione.");
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
            alert("Variante aggiornata!");
        } catch (err) {
            alert("Errore durante l'aggiornamento.");
        }
    };

    return (
        <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg text-[#0b224e]">Varianti Prodotto</h3>
                    <p className="text-sm text-slate-500">Gestisci stock, SKU e prezzi specifici per ogni variante.</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition disabled:opacity-50"
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
                            <th className="px-4 py-3">Immagine</th>
                            <th className="px-4 py-3">SKU</th>
                            <th className="px-4 py-3">Prezzo (€)</th>
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
                                    </td>
                                    <td className="px-4 py-4">
                                        {editingId === v.id ? (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="glass-input py-1 px-2 text-xs w-24"
                                                    value={editForm.mediaIndex ?? ""}
                                                    onChange={e => setEditForm(prev => ({ ...prev, mediaIndex: e.target.value === "" ? null : parseInt(e.target.value) }))}
                                                >
                                                    <option value="">Nessuna</option>
                                                    {media.map((_, idx) => (
                                                        <option key={idx} value={idx}>Img #{idx + 1}</option>
                                                    ))}
                                                </select>
                                                {editForm.mediaIndex !== null && editForm.mediaIndex !== undefined && media[editForm.mediaIndex] && (
                                                    <img src={media[editForm.mediaIndex].url} className="w-8 h-8 object-cover rounded" alt="" />
                                                )}
                                            </div>
                                        ) : (
                                            v.mediaIndex !== null && v.mediaIndex !== undefined && media[v.mediaIndex] ? (
                                                <img src={media[v.mediaIndex].url} className="w-8 h-8 object-cover rounded border border-slate-200" alt="Variant" />
                                            ) : (
                                                <span className="text-slate-300 text-xs italic">Nessuna</span>
                                            )
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
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
                                    <td className="px-4 py-4">
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
