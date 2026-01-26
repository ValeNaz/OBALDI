"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "../../context/UserContext";
import { FaCheck, FaCoins, FaLightbulb } from "react-icons/fa";

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
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Background */}
      <div className="hidden md:block pointer-events-none absolute -top-40 right-[-15%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#0b224e]/8 to-[#0b224e]/3 blur-[120px]" />
      <div className="hidden md:block pointer-events-none absolute top-[60%] left-[-10%] h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-[#a41f2e]/6 to-transparent blur-[100px]" />

      <div className="container-max page-pad pt-36 md:pt-32 pb-20">
        {/* Hero */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-[#0b224e] mb-6 leading-tight">
            Acquistare online può essere semplice.
            <span className="block text-[#a41f2e]">Se sai di chi fidarti.</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Obaldi è un ecosistema riservato, creato per offrire sicurezza, trasparenza e supporto reale negli acquisti online.
          </p>
        </div>

        {/* Come entrare */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="glass-card card-pad text-center">
            <h2 className="text-2xl font-bold text-[#0b224e] mb-4">
              Come posso entrare e iniziare a ricevere assistenza?
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Entrare in Obaldi è molto semplice. La tutela dei nostri membri è la cosa più importante per noi.
              Per entrare ti basterà semplicemente <strong>iscriverti</strong>.
            </p>
          </div>
        </div>

        {/* Email input */}
        <div className="max-w-2xl mx-auto mb-12">
          <label className="block text-sm font-bold text-slate-700 mb-2">La tua email</label>
          <input
            type="email"
            className="glass-input w-full text-center text-lg py-4"
            placeholder="Inserisci la tua email per iniziare"
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
              Membership attiva! Trovi i dettagli nella tua area riservata.
            </div>
          )}
        </div>

        {/* Piani */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {/* Piano Tutela Completa - €4,90 */}
          <div className="glass-card card-pad flex flex-col glass-hover">
            <h2 className="text-2xl font-display font-bold text-[#0b224e] mb-2">
              Obaldi Tutela Completa
            </h2>
            <div className="text-4xl font-black mb-2 text-[#0b224e]">
              €4,90 <span className="text-sm font-normal text-slate-400">/ mese</span>
            </div>
            <p className="text-slate-500 text-sm mb-6">
              Protezione e supporto per tutti i tuoi acquisti online, su Obaldi e su siti esterni.
            </p>

            <div className="mb-4">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Cosa include</p>
              <ul className="space-y-3 text-slate-600 flex-grow">
                <li className="flex items-start gap-2">
                  <FaCheck className="text-[#0b224e] mt-1 flex-shrink-0" />
                  <span>Un team dedicato che ti affianca <strong>prima di ogni acquisto</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-[#0b224e] mt-1 flex-shrink-0" />
                  <span>Analisi dell'affidabilità di siti esterni</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-[#0b224e] mt-1 flex-shrink-0" />
                  <span>Verifica dell'attendibilità dell'offerta</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-[#0b224e] mt-1 flex-shrink-0" />
                  <span>Controllo prezzo-prodotto coerente</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-[#0b224e] mt-1 flex-shrink-0" />
                  <span>Valutazione fattori di rischio</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-[#0b224e] mt-1 flex-shrink-0" />
                  <span>Confronto prezzi per trovare l'offerta migliore</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-[#0b224e] mt-1 flex-shrink-0" />
                  <span>Supporto ricerca prodotti non su Obaldi</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-slate-500 italic mb-6">
              Ti aiutiamo a trovare il prodotto che desideri al prezzo più basso possibile.
            </p>

            <div className="space-y-3 mt-auto">
              <button
                onClick={() => handleCheckout("ACCESSO", "stripe")}
                className="w-full py-4 border-2 border-[#0b224e] text-[#0b224e] font-bold rounded-full hover:bg-[#0b224e] hover:text-white transition"
                disabled={loadingPlan === "ACCESSO-stripe"}
              >
                {loadingPlan === "ACCESSO-stripe" ? "Reindirizzamento..." : "Iscriviti con Carta"}
              </button>
              <button
                onClick={() => handleCheckout("ACCESSO", "paypal")}
                className="w-full py-3 border-2 border-slate-300 text-slate-600 font-bold rounded-full hover:bg-slate-50 transition"
                disabled={loadingPlan === "ACCESSO-paypal"}
              >
                {loadingPlan === "ACCESSO-paypal" ? "Reindirizzamento..." : "Iscriviti con PayPal"}
              </button>
            </div>
          </div>

          {/* Piano Compra Sicuro - €9,90 */}
          <div className="glass-card card-pad flex flex-col relative overflow-hidden border-[#0b224e]/60 shadow-glow-soft">
            <div className="absolute top-0 right-0 bg-[#0b224e] text-white px-4 py-1 text-xs font-bold uppercase tracking-widest">
              Completo
            </div>
            <h2 className="text-2xl font-display font-bold text-[#0b224e] mb-2">
              Obaldi Compra Sicuro
            </h2>
            <div className="text-4xl font-black mb-2 text-[#0b224e]">
              €9,90 <span className="text-sm font-normal text-slate-400">/ mese</span>
            </div>
            <p className="text-slate-500 text-sm mb-6">
              Entra nell'ecosistema Obaldi e acquista in un ambiente selezionato e sicuro.
            </p>

            <div className="mb-4">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Cosa include</p>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-2">
                  <FaCoins className="text-[#a41f2e] mt-1 flex-shrink-0" />
                  <span><strong>10 Punti Obaldi</strong> ad ogni rinnovo</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-[#0b224e] mt-1 flex-shrink-0" />
                  <span>Accesso completo a Obaldi</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-[#0b224e] mt-1 flex-shrink-0" />
                  <span>Possibilità di acquistare tutti i prodotti</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-[#0b224e] mt-1 flex-shrink-0" />
                  <span>Prodotti selezionati e verificati</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-[#0b224e] mt-1 flex-shrink-0" />
                  <span className="font-semibold">Tutti i vantaggi di Tutela Completa</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#0b224e]/5 rounded-xl p-4 mb-6">
              <p className="text-sm text-[#0b224e] font-medium flex items-start gap-2">
                <FaLightbulb className="flex-shrink-0 mt-0.5" />
                <span>Il pagamento dell'abbonamento diventa <strong>credito spendibile</strong> nel marketplace per prodotti esclusivi.</span>
              </p>
            </div>

            <div className="space-y-3 mt-auto">
              <button
                onClick={() => handleCheckout("TUTELA", "stripe")}
                className="w-full py-4 bg-[#0b224e] text-white font-bold rounded-full hover:opacity-95 transition shadow-glow-soft"
                disabled={loadingPlan === "TUTELA-stripe"}
              >
                {loadingPlan === "TUTELA-stripe" ? "Reindirizzamento..." : "Iscriviti con Carta"}
              </button>
              <button
                onClick={() => handleCheckout("TUTELA", "paypal")}
                className="w-full py-3 border-2 border-slate-300 text-slate-600 font-bold rounded-full hover:bg-slate-50 transition"
                disabled={loadingPlan === "TUTELA-paypal"}
              >
                {loadingPlan === "TUTELA-paypal" ? "Reindirizzamento..." : "Iscriviti con PayPal"}
              </button>
            </div>
          </div>
        </div>

        {/* Punti Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-gradient-to-br from-[#0b224e] to-[#1a3a6e] rounded-3xl p-10 text-white text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Obaldi premia chi ci dà la sua fiducia
            </h3>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Ogni mese che rinnovi la tua fiducia con Obaldi, il pagamento dell'abbonamento (€9,90)
              viene convertito in <strong>credito spendibile</strong> all'interno del marketplace
              per acquistare prodotti o servizi esclusivi.
            </p>
            <p className="text-xl font-semibold">
              Ricevi assistenza, acquisti in modo sicuro, e il costo diventa credito.
            </p>
          </div>
        </div>

        {/* Valore Territorio */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#0b224e] mb-4">
              Il valore di Obaldi per il territorio
            </h2>
          </div>

          <div className="glass-card card-pad">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-[#0b224e] mb-4">
                  Supportiamo le attività locali
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Obaldi premia e valorizza le attività locali, collaborando con numerosi fornitori del territorio
                  per aiutarli a farsi conoscere e a vendere i propri prodotti.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Attraverso il supporto e la visibilità offerti da Obaldi, queste realtà possono raggiungere
                  nuovi clienti <strong>senza sostenere costi pubblicitari</strong>, mantenendo prezzi più bassi.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0b224e] mb-4">
                  Ti guidiamo alla scelta migliore
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  In un mercato online dominante, le attività locali spesso propongono offerte convenienti
                  ma faticano a emergere. <strong>Obaldi sa dove trovarle.</strong>
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Quando individuiamo un'opportunità valida, ti guidiamo verso la soluzione migliore:
                  un acquisto su Obaldi oppure direttamente presso il venditore locale.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 text-center">
              <p className="text-lg text-[#0b224e] font-semibold">
                Obaldi trova il valore dove gli altri non guardano: nei prezzi giusti e nelle realtà locali che meritano visibilità.
              </p>
            </div>
          </div>
        </div>

        {/* CTA finale */}
        <div className="text-center">
          <p className="text-slate-500 text-sm">
            Rinnovo automatico ogni mese. Disdici quando vuoi dalla tua area riservata.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Membership;
