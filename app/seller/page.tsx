"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";

const SellerDashboard = () => {
  const { user } = useUser();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user && user.role !== "SELLER") {
      router.push("/");
    }
  }, [router, user]);

  if (!user || user.role !== "SELLER") {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-32 pb-12">
      <h1 className="text-3xl font-bold text-[#0b224e] mb-8">Dashboard Venditore</h1>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 text-green-700 p-8 rounded-2xl text-center">
          <h2 className="text-xl font-bold mb-2">Prodotto inviato per revisione</h2>
          <p className="text-sm">
            Il team Obaldi analizzerà la tua proposta. Riceverai una notifica ad approvazione completata.
          </p>
          <button onClick={() => setSubmitted(false)} className="mt-6 text-sm font-bold underline">
            Inserisci un altro prodotto
          </button>
        </div>
      ) : (
        <div className="bg-white border rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Proponi nuovo prodotto</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nome Prodotto</label>
                <input
                  required
                  type="text"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0b224e] outline-none"
                  placeholder="Esempio: Token hardware"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Prezzo (€)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0b224e] outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Descrizione Dettagliata</label>
              <textarea
                required
                rows={4}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0b224e] outline-none"
                placeholder="Descrivi il prodotto, la sua utilità e come tutela l'utente..."
              ></textarea>
            </div>
            <div className="border-t pt-6 flex justify-between items-center">
              <p className="text-xs text-slate-400 max-w-xs">
                Il prodotto non sarà visibile finché non verrà approvato da un amministratore Obaldi.
              </p>
              <button type="submit" className="bg-[#0b224e] text-white px-8 py-3 rounded-lg font-bold">
                Invia per Revisione
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
