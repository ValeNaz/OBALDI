"use client";

import { useState } from "react";
import StarRating from "./StarRating";
import { useUser } from "@/context/UserContext";

interface ReviewFormProps {
    productId: string;
    orderId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const ReviewForm = ({ productId, orderId, onSuccess, onCancel }: ReviewFormProps) => {
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Seleziona un voto.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/products/${productId}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    rating,
                    title,
                    body
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || "Errore durante l'invio della recensione");

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-xl space-y-4">
            <h3 className="font-bold text-[#0b224e]">Scrivi la tua recensione</h3>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Voto *</label>
                <StarRating rating={rating} size={24} interactive onChange={setRating} />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Titolo (opzionale)</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0b224e] focus:outline-none"
                    placeholder="Riassumi la tua esperienza"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Recensione (opzionale)</label>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0b224e] focus:outline-none"
                    placeholder="Cosa ti è piaciuto di più?"
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-200 transition text-sm font-semibold"
                >
                    Annulla
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-lg bg-[#0b224e] text-white hover:bg-[#1a3a6e] transition text-sm font-semibold disabled:opacity-50"
                >
                    {loading ? "Invio..." : "invia Recensione"}
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;
