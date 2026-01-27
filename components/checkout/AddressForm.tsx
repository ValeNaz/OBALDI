"use client";

import { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface AddressFormData {
    label?: string;
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    phone?: string;
    isDefault?: boolean;
}

interface AddressFormProps {
    initialData?: AddressFormData;
    onSubmit: (data: AddressFormData) => Promise<void>;
    onCancel: () => void;
}

const AddressForm = ({ initialData, onSubmit, onCancel }: AddressFormProps) => {
    const [formData, setFormData] = useState<AddressFormData>(
        initialData || {
            label: "",
            fullName: "",
            line1: "",
            line2: "",
            city: "",
            province: "",
            postalCode: "",
            country: "IT",
            phone: "",
            isDefault: false,
        }
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.fullName || !formData.line1 || !formData.city || !formData.province || !formData.postalCode) {
                throw new Error("Compila tutti i campi obbligatori.");
            }
            await onSubmit(formData);
        } catch (err: any) {
            setError(err.message || "Si è verificato un errore.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-display font-bold text-lg text-[#0b224e]">
                        {initialData ? "Modifica indirizzo" : "Nuovo indirizzo"}
                    </h3>
                    <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 transition">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Città *</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0b224e] focus:outline-none"
                                placeholder="Roma"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">CAP *</label>
                            <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0b224e] focus:outline-none"
                                placeholder="00100"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Nome completo (Destinatario) *</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0b224e] focus:outline-none"
                            placeholder="Mario Rossi"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Indirizzo *</label>
                        <input
                            type="text"
                            name="line1"
                            value={formData.line1}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0b224e] focus:outline-none"
                            placeholder="Via Roma 1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Interno / Scala (opzionale)</label>
                        <input
                            type="text"
                            name="line2"
                            value={formData.line2}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0b224e] focus:outline-none"
                            placeholder="Scala B, Int 4"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Provincia *</label>
                            <input
                                type="text"
                                name="province"
                                value={formData.province}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0b224e] focus:outline-none"
                                placeholder="RM"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Paese</label>
                            <select
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0b224e] focus:outline-none"
                            >
                                <option value="IT">Italia</option>
                                <option value="SM">San Marino</option>
                                <option value="VA">Città del Vaticano</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Telefono (opzionale)</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0b224e] focus:outline-none"
                                placeholder="+39 333 1234567"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Etichetta (es. Casa)</label>
                            <input
                                type="text"
                                name="label"
                                value={formData.label}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0b224e] focus:outline-none"
                                placeholder="Casa"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            id="isDefault"
                            name="isDefault"
                            checked={formData.isDefault}
                            onChange={handleChange}
                            className="rounded border-slate-300 text-[#0b224e] focus:ring-[#0b224e]"
                        />
                        <label htmlFor="isDefault" className="text-sm text-slate-600">Imposta come indirizzo predefinito</label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
                            disabled={loading}
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 rounded-lg bg-[#0b224e] text-white font-semibold hover:bg-[#1a3a6e] transition disabled:opacity-70"
                            disabled={loading}
                        >
                            {loading ? "Salvataggio..." : "Salva Indirizzo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddressForm;
