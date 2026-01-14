"use client";

import { useState } from "react";

type CreatedProduct = {
  id: string;
  title: string;
  priceCents: number;
};

const SellerDashboard = () => {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedProduct | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    pointsEligible: false,
    pointsPrice: "",
    specsJson: '{"format":"pdf"}'
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    let specs: Record<string, unknown>;
    try {
      specs = JSON.parse(form.specsJson || "{}");
    } catch {
      setError("Specifiche non valide: inserisci JSON corretto.");
      return;
    }

    const priceNumber = Number(form.price);
    if (!priceNumber || priceNumber <= 0) {
      setError("Inserisci un prezzo valido.");
      return;
    }

    const pointsPriceNumber = form.pointsEligible ? Number(form.pointsPrice) : null;
    if (form.pointsEligible && (!pointsPriceNumber || pointsPriceNumber <= 0)) {
      setError("Inserisci un prezzo punti valido.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      specsJson: specs,
      priceCents: Math.round(priceNumber * 100),
      currency: "EUR",
      pointsEligible: form.pointsEligible,
      pointsPrice: form.pointsEligible ? pointsPriceNumber ?? undefined : undefined
    };

    const createProduct = async () => {
      const response = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        setError("Errore durante la creazione del prodotto.");
        return;
      }

      const data = await response.json();
      setCreated({
        id: data.product.id,
        title: data.product.title,
        priceCents: data.product.priceCents
      });
      setSubmitted(true);
    };

    createProduct();
  };

  const handleSubmitForReview = async () => {
    if (!created) return;
    const response = await fetch(`/api/seller/products/${created.id}/submit`, {
      method: "POST"
    });

    if (!response.ok) {
      setError("Errore durante l'invio per revisione.");
      return;
    }

    setError(null);
    setSubmitted(true);
  };

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-16">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-[#0b224e] mb-8">Dashboard Venditore</h1>

      {submitted ? (
        <div className="glass-panel p-8 text-center">
          <h2 className="text-xl font-bold mb-2 text-[#0b224e]">Prodotto inviato per revisione</h2>
          <p className="text-sm">
            Il team Obaldi analizzerà la tua proposta. Riceverai una notifica ad approvazione completata.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setCreated(null);
            }}
            className="mt-6 text-sm font-bold underline text-[#0b224e]"
          >
            Inserisci un altro prodotto
          </button>
          {created && (
            <div className="mt-4 text-xs text-green-700">
              ID prodotto: {created.id}
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card card-pad">
          <h2 className="text-xl font-bold mb-6 text-[#0b224e]">Proponi nuovo prodotto</h2>
          {error && <p className="mb-4 text-sm text-red-600 font-semibold">{error}</p>}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nome Prodotto</label>
                <input
                  required
                  type="text"
                  className="glass-input w-full"
                  placeholder="Esempio: Token hardware"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Prezzo (€)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  className="glass-input w-full"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Descrizione Dettagliata</label>
              <textarea
                required
                rows={4}
                className="glass-input w-full"
                placeholder="Descrivi il prodotto, la sua utilità e come tutela l'utente..."
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Specifiche (JSON)</label>
              <textarea
                rows={3}
                className="glass-input w-full font-mono text-xs"
                value={form.specsJson}
                onChange={(event) => setForm((prev) => ({ ...prev, specsJson: event.target.value }))}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.pointsEligible}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, pointsEligible: event.target.checked }))
                  }
                />
                Abilita pagamento con punti
              </label>
              {form.pointsEligible && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Prezzo in punti</label>
                  <input
                    type="number"
                    className="glass-input w-full"
                    value={form.pointsPrice}
                    onChange={(event) => setForm((prev) => ({ ...prev, pointsPrice: event.target.value }))}
                  />
                </div>
              )}
            </div>
            <div className="border-t pt-6 flex justify-between items-center">
              <p className="text-xs text-slate-400 max-w-xs">
                Il prodotto non sarà visibile finché non verrà approvato da un amministratore Obaldi.
              </p>
              <button type="submit" className="bg-[#0b224e] text-white px-8 py-3 rounded-full font-bold shadow-glow-soft">
                Invia per Revisione
              </button>
            </div>
          </form>
        </div>
      )}
      {created && !submitted && (
        <div className="mt-6 glass-panel p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#0b224e]">Prodotto creato: {created.title}</p>
            <p className="text-xs text-slate-500">€{(created.priceCents / 100).toFixed(2)}</p>
          </div>
          <button
            onClick={handleSubmitForReview}
            className="bg-[#0b224e] text-white px-6 py-2 rounded-full text-sm font-bold shadow-glow-soft"
          >
            Invia per revisione
          </button>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
