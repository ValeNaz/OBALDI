export default function ResiRimborsiPage() {
  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-20">
      <div className="glass-card card-pad max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[#0b224e] mb-6">
          Resi e rimborsi
        </h1>
        <p className="text-sm text-slate-400 mb-6">Ultimo aggiornamento: [DATA]</p>
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">1. Diritto di recesso</h2>
            <p>
              Il cliente puo&apos; esercitare il diritto di recesso entro 14 giorni dalla consegna,
              salvo eccezioni previste dalla legge. Per avviare la richiesta, contatta il supporto.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">2. Condizioni del reso</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Il prodotto deve essere integro, completo di accessori e imballo originale.</li>
              <li>Eventuali danni o segni di uso possono ridurre o escludere il rimborso.</li>
              <li>I tempi di restituzione sono comunicati via email dal supporto.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">3. Rimborsi</h2>
            <p>
              Il rimborso viene emesso dopo la verifica del reso. I tempi dipendono dal metodo di
              pagamento. Eventuali punti utilizzati verranno ripristinati sul saldo.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">4. Eccezioni</h2>
            <p>
              Alcuni prodotti possono essere esclusi dal recesso (es. beni personalizzati o sigillati
              aperti). L&apos;eventuale esclusione sara&apos; indicata nella scheda prodotto.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">5. Membership</h2>
            <p>
              La membership e&apos; un servizio digitale. Eventuali rimborsi seguono le condizioni
              previste nei Termini e condizioni e nella normativa applicabile.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200/60">
            <p>
              Per avviare un reso scrivi a supporto@obaldi.it indicando numero ordine e motivo
              della richiesta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
