"use client";

import { useState } from "react";
import { FaTag, FaTimes, FaCheck } from "react-icons/fa";

interface CouponInputProps {
    onApply: (code: string) => Promise<boolean>; // return true if valid
    onRemove: () => void;
    orderTotalCents: number;
}

const CouponInput = ({ onApply, onRemove, orderTotalCents }: CouponInputProps) => {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [appliedCode, setAppliedCode] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const isValid = await onApply(code);
            if (isValid) {
                setAppliedCode(code);
                setSuccessMessage("Coupon applicato con successo!");
                setCode("");
            }
        } catch (err: any) {
            setError(err.message || "Coupon non valido");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        onRemove();
        setAppliedCode(null);
        setSuccessMessage(null);
        setError(null);
    };

    if (appliedCode) {
        return (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <FaCheck size={14} />
                    </div>
                    <div>
                        <div className="font-bold text-green-800 text-sm">Coupon {appliedCode}</div>
                        <div className="text-xs text-green-600">Sconto applicato al carrello</div>
                    </div>
                </div>
                <button
                    onClick={handleRemove}
                    className="p-2 text-slate-400 hover:text-red-500 transition"
                >
                    <FaTimes size={14} />
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0b224e]">
                <FaTag className="text-slate-400" />
                Hai un codice sconto?
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Inserisci codice"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0b224e] focus:outline-none uppercase placeholder:normal-case"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={!code || loading}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0b224e] transition disabled:opacity-50"
                >
                    {loading ? "Verifica..." : "Applica"}
                </button>
            </form>

            {error && (
                <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                    {error}
                </div>
            )}
        </div>
    );
};

export default CouponInput;
