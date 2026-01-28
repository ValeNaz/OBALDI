"use client";

import { useState } from "react";
import { FaPlus, FaTrash, FaGripVertical } from "react-icons/fa";

type Option = {
    id?: string;
    name: string;
    values: string[];
    position: number;
};

type OptionManagerProps = {
    productId: string;
    initialOptions: Option[];
    onSave: (options: Option[]) => Promise<void>;
};

export default function OptionManager({ productId, initialOptions, onSave }: OptionManagerProps) {
    const [options, setOptions] = useState<Option[]>(
        initialOptions.sort((a, b) => a.position - b.position)
    );
    const [saving, setSaving] = useState(false);

    const addOption = () => {
        setOptions([
            ...options,
            { name: "", values: [], position: options.length }
        ]);
    };

    const removeOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const updateOptionName = (index: number, name: string) => {
        const newOptions = [...options];
        newOptions[index].name = name;
        setOptions(newOptions);
    };

    const addValue = (index: number, value: string) => {
        if (!value.trim()) return;
        const newOptions = [...options];
        if (!newOptions[index].values.includes(value.trim())) {
            newOptions[index].values.push(value.trim());
            setOptions(newOptions);
        }
    };

    const removeValue = (optIndex: number, valIndex: number) => {
        const newOptions = [...options];
        newOptions[optIndex].values = newOptions[optIndex].values.filter((_, i) => i !== valIndex);
        setOptions(newOptions);
    };

    const handleSave = async () => {
        // Validate
        if (options.some(o => !o.name.trim() || o.values.length === 0)) {
            alert("Ogni opzione deve avere un nome e almeno un valore.");
            return;
        }

        setSaving(true);
        try {
            await onSave(options);
            alert("Opzioni salvate correttamente!");
        } catch (err) {
            alert("Errore durante il salvataggio.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-[#0b224e]">Opzioni Prodotto</h3>
                <button
                    onClick={addOption}
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition"
                >
                    <FaPlus /> Aggiungi Opzione
                </button>
            </div>

            <p className="text-sm text-slate-500 mb-6">
                Definisci le varianti del prodotto (es. Taglia, Colore).
                Il salvataggio delle opzioni ti permetterà di generare le varianti corrispondenti.
            </p>

            <div className="space-y-6">
                {options.map((opt, optIdx) => (
                    <div key={optIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                        <button
                            onClick={() => removeOption(optIdx)}
                            className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition"
                        >
                            <FaTrash size={12} />
                        </button>

                        <div className="grid md:grid-cols-4 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome Opzione</label>
                                <input
                                    type="text"
                                    className="glass-input w-full text-sm"
                                    placeholder="Es: Colore"
                                    value={opt.name}
                                    onChange={(e) => updateOptionName(optIdx, e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valori</label>
                                <div className="flex flex-wrap gap-2 items-center">
                                    {opt.values.map((val, valIdx) => (
                                        <span key={valIdx} className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-[#0b224e] flex items-center gap-2 group/val">
                                            {val}
                                            <button
                                                onClick={() => removeValue(optIdx, valIdx)}
                                                className="text-slate-300 hover:text-red-500"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        className="bg-transparent border-none focus:ring-0 text-xs font-medium w-32"
                                        placeholder="Aggiungi valore..."
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addValue(optIdx, e.currentTarget.value);
                                                e.currentTarget.value = "";
                                            }
                                        }}
                                        onBlur={(e) => {
                                            addValue(optIdx, e.currentTarget.value);
                                            e.currentTarget.value = "";
                                        }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2">Premi invio per aggiungere un valore.</p>
                            </div>
                        </div>
                    </div>
                ))}

                {options.length === 0 && (
                    <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                        Nessuna opzione definita.
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#0b224e] text-white px-8 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition disabled:opacity-50"
                >
                    {saving ? "Salvataggio..." : "Salva Opzioni"}
                </button>
            </div>
        </div>
    );
}
