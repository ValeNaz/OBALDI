"use client";

import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";

type Provider = "stripe" | "paypal";

const Membership = () => {
  const { user, refresh } = useUser();
  const [email, setEmail] = useState(user?.email ?? "");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      setSuccess(true);
      refresh();
    }
  }, [refresh]);

  const handleCheckout = async (planCode: "ACCESSO" | "TUTELA", provider: Provider) => {
    setError(null);
    if (!email.trim()) {
      setError("Inserisci un'email valida per continuare.");
      return;
    }
    setLoadingPlan(`${planCode}-${provider}`);
    try {
      const endpoint =
        provider === "stripe"
          ? "/api/membership/stripe/create"
          : "/api/membership/paypal/create";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode, email: email.trim() })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message ?? "Impossibile avviare il pagamento.");
        return;
      }
      if (payload?.url) {
        window.location.href = payload.url;
      } else {
        setError("Impossibile avviare il pagamento.");
      }
    } catch {
      setError("Impossibile avviare il pagamento.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] mb-4">
          Diventa un Membro Obaldi
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          L&apos;accesso al nostro marketplace è riservato. Scegliendo uno dei nostri piani finanzi la nostra attività di
          ricerca e tutela anti-truffa.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-10">
        <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
        <input
          type="email"
          className="glass-input w-full"
          placeholder="Inserisci la tua email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {error && (
          <div className="mt-4 text-sm text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 text-sm text-green-700 font-semibold bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            Membership attiva! Trovi i dettagli nella tua area riservata e puoi impostare la password.
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="glass-card card-pad flex flex-col glass-hover">
          <h2 className="text-2xl font-display font-bold mb-2">Obaldi Accesso</h2>
          <div className="text-4xl font-black mb-6 text-[#0b224e]">
            €4,90 <span className="text-sm font-normal text-slate-400">/ 28 giorni</span>
          </div>
          <ul className="space-y-4 mb-10 flex-grow text-slate-600">
            <li className="flex items-center">
              <span className="text-slate-400 mr-2">✓</span> Accesso completo al Marketplace
            </li>
            <li className="flex items-center">
              <span className="text-slate-400 mr-2">✓</span> Spedizioni gratuite incluse
            </li>
            <li className="flex items-center">
              <span className="text-slate-400 mr-2">✓</span> News Alert Truffe prioritari
            </li>
          </ul>
          <div className="space-y-3">
            <button
              onClick={() => handleCheckout("ACCESSO", "stripe")}
              className="w-full py-4 border-2 border-[#0b224e] text-[#0b224e] font-bold rounded-full hover:bg-white/60 transition"
              disabled={loadingPlan === "ACCESSO-stripe"}
            >
              {loadingPlan === "ACCESSO-stripe" ? "Reindirizzamento..." : "Paga con Carta"}
            </button>
            <button
              onClick={() => handleCheckout("ACCESSO", "paypal")}
              className="w-full py-3 border-2 border-slate-300 text-slate-600 font-bold rounded-full hover:bg-white/70 transition"
              disabled={loadingPlan === "ACCESSO-paypal"}
            >
              {loadingPlan === "ACCESSO-paypal" ? "Reindirizzamento..." : "Paga con PayPal"}
            </button>
          </div>
        </div>

        <div className="glass-card card-pad flex flex-col relative overflow-hidden border-[#0b224e]/60 shadow-glow-soft">
          <div className="absolute top-0 right-0 bg-[#0b224e] text-white px-4 py-1 text-xs font-bold uppercase tracking-widest">
            Premium
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Tutela Completa</h2>
          <div className="text-4xl font-black mb-6 text-[#0b224e]">
            €9,90 <span className="text-sm font-normal text-slate-400">/ 28 giorni</span>
          </div>
          <ul className="space-y-4 mb-10 flex-grow text-slate-600">
            <li className="flex items-center">
              <span className="text-[#a41f2e] mr-2">🪙</span> 10 Punti Obaldi ogni 28 giorni
            </li>
            <li className="flex items-center">
              <span className="text-slate-400 mr-2">✓</span> Richiesta analisi acquisti esterni
            </li>
            <li className="flex items-center">
              <span className="text-slate-400 mr-2">✓</span> Prodotti esclusivi con Punti
            </li>
            <li className="flex items-center">
              <span className="text-slate-400 mr-2">✓</span> Tutte le funzioni di Accesso
            </li>
          </ul>
          <div className="space-y-3">
            <button
              onClick={() => handleCheckout("TUTELA", "stripe")}
              className="w-full py-4 bg-[#0b224e] text-white font-bold rounded-full hover:opacity-95 transition shadow-glow-soft"
              disabled={loadingPlan === "TUTELA-stripe"}
            >
              {loadingPlan === "TUTELA-stripe" ? "Reindirizzamento..." : "Paga con Carta"}
            </button>
            <button
              onClick={() => handleCheckout("TUTELA", "paypal")}
              className="w-full py-3 border-2 border-slate-300 text-slate-600 font-bold rounded-full hover:bg-white/70 transition"
              disabled={loadingPlan === "TUTELA-paypal"}
            >
              {loadingPlan === "TUTELA-paypal" ? "Reindirizzamento..." : "Paga con PayPal"}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-12 text-center text-xs text-slate-400">
        Rinnovo automatico ogni 28 giorni. Disdici quando vuoi dalla tua area riservata.
      </p>
    </div>
  );
};

export default Membership;
