"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { FaBell, FaPalette, FaLock, FaKey, FaUser } from "react-icons/fa";

type Settings = {
    notifyOrders: boolean;
    notifyPromotions: boolean;
    notifyNewsletter: boolean;
    darkMode: boolean;
    language: string;
};

export default function SettingsPage() {
    const { user } = useUser();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetch("/api/user/settings", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data.settings);
                } else {
                    setError("Impossibile caricare le impostazioni.");
                }
            } catch {
                setError("Errore di connessione.");
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleToggle = (key: keyof Settings) => {
        if (!settings) return;
        setSettings({ ...settings, [key]: !settings[key] });
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
                credentials: "include"
            });

            if (res.ok) {
                setSuccess("Impostazioni salvate con successo.");
            } else {
                setError("Impossibile salvare le impostazioni.");
            }
        } catch {
            setError("Errore di connessione.");
        } finally {
            setSaving(false);
        }
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

    if (loading) {
        return (
            <div className="container-max page-pad pt-28 md:pt-32 pb-20">
                <div className="glass-panel p-8 text-center text-slate-500">Caricamento impostazioni...</div>
            </div>
        );
    }

    return (
        <div className="container-max page-pad pt-28 md:pt-32 pb-20">
            <div className="mb-10">
                <Link href="/profile" className="text-sm text-slate-500 hover:text-[#0b224e] mb-4 inline-block">
                    ← Torna al profilo
                </Link>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e]">Impostazioni</h1>
                <p className="text-slate-500 mt-2">Personalizza le tue preferenze di notifica e visualizzazione.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-4xl">
                {/* Notifiche */}
                <div className="glass-card card-pad">
                    <h2 className="text-xl font-bold text-[#0b224e] mb-6 flex items-center gap-2">
                        <FaBell /> Notifiche
                    </h2>
                    <div className="space-y-4">
                        <ToggleItem
                            label="Notifiche ordini"
                            description="Ricevi aggiornamenti sullo stato dei tuoi ordini"
                            enabled={settings?.notifyOrders ?? true}
                            onChange={() => handleToggle("notifyOrders")}
                        />
                        <ToggleItem
                            label="Offerte e promozioni"
                            description="Ricevi notifiche su sconti e offerte speciali"
                            enabled={settings?.notifyPromotions ?? true}
                            onChange={() => handleToggle("notifyPromotions")}
                        />
                        <ToggleItem
                            label="Newsletter"
                            description="Ricevi aggiornamenti via email su novità e contenuti"
                            enabled={settings?.notifyNewsletter ?? false}
                            onChange={() => handleToggle("notifyNewsletter")}
                        />
                    </div>
                </div>

                {/* Aspetto */}
                <div className="glass-card card-pad">
                    <h2 className="text-xl font-bold text-[#0b224e] mb-6 flex items-center gap-2">
                        <FaPalette /> Aspetto
                    </h2>
                    <div className="space-y-4">
                        <ToggleItem
                            label="Modalità scura"
                            description="Attiva il tema scuro per un'esperienza più confortevole"
                            enabled={settings?.darkMode ?? false}
                            onChange={() => handleToggle("darkMode")}
                            disabled
                            disabledNote="Presto disponibile"
                        />
                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Lingua</label>
                            <select
                                value={settings?.language ?? "it"}
                                onChange={(e) => setSettings(settings ? { ...settings, language: e.target.value } : null)}
                                className="glass-input w-full py-2"
                            >
                                <option value="it">Italiano</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Privacy */}
                <div className="glass-card card-pad lg:col-span-2">
                    <h2 className="text-xl font-bold text-[#0b224e] mb-6 flex items-center gap-2">
                        <FaLock /> Privacy e Sicurezza
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Link
                            href="/profile#security"
                            className="glass-panel p-4 hover:shadow-md transition-shadow flex items-center gap-4"
                        >
                            <FaKey className="text-2xl text-[#0b224e]" />
                            <div>
                                <p className="font-bold text-slate-700">Cambia password</p>
                                <p className="text-sm text-slate-500">Aggiorna la tua password di accesso</p>
                            </div>
                        </Link>
                        <Link
                            href="/profile"
                            className="glass-panel p-4 hover:shadow-md transition-shadow flex items-center gap-4"
                        >
                            <FaUser className="text-2xl text-[#0b224e]" />
                            <div>
                                <p className="font-bold text-slate-700">Dati personali</p>
                                <p className="text-sm text-slate-500">Modifica le tue informazioni personali</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Feedback */}
                {error && (
                    <div className="lg:col-span-2 text-sm text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="lg:col-span-2 text-sm text-green-700 font-semibold bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                        {success}
                    </div>
                )}

                {/* Actions */}
                <div className="lg:col-span-2 flex justify-end gap-4">
                    <Link
                        href="/profile"
                        className="px-6 py-3 rounded-full font-bold text-slate-600 hover:bg-slate-100 transition"
                    >
                        Annulla
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-[#0b224e] text-white rounded-full font-bold hover:shadow-glow-soft transition disabled:opacity-50"
                    >
                        {saving ? "Salvataggio..." : "Salva impostazioni"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ToggleItem({
    label,
    description,
    enabled,
    onChange,
    disabled = false,
    disabledNote,
}: {
    label: string;
    description: string;
    enabled: boolean;
    onChange: () => void;
    disabled?: boolean;
    disabledNote?: string;
}) {
    return (
        <div className={`flex items-center justify-between p-4 rounded-xl ${disabled ? "opacity-50" : "hover:bg-slate-50"}`}>
            <div className="flex-1 mr-4">
                <p className="font-bold text-slate-700">{label}</p>
                <p className="text-sm text-slate-500">{description}</p>
                {disabled && disabledNote && (
                    <p className="text-xs text-amber-600 mt-1">{disabledNote}</p>
                )}
            </div>
            <button
                onClick={onChange}
                disabled={disabled}
                className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? "bg-[#0b224e]" : "bg-slate-300"
                    } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
                <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-0"
                        }`}
                />
            </button>
        </div>
    );
}
