export default function PrivacyPage() {
  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-20">
      <div className="glass-card card-pad max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[#0b224e] mb-6">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-400 mb-6">Ultimo aggiornamento: [DATA]</p>
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">Titolare del trattamento</h2>
            <p>
              [RAGIONE SOCIALE], P.IVA [P.IVA], con sede in [INDIRIZZO COMPLETO].
            </p>
            <p>Contatti privacy: privacy@obaldi.it</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">Dati trattati</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Dati di account e membership (email, ruolo, stato abbonamento).</li>
              <li>Dati di pagamento (gestiti da Stripe/PayPal; non memorizziamo i dati carta).</li>
              <li>Dati relativi a ordini, punti e richieste di assistenza acquisti.</li>
              <li>Dati tecnici di navigazione e sicurezza (log, IP, cookie tecnici).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">Finalita e basi giuridiche</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Erogare i servizi Obaldi e gestire ordini e membership (contratto).</li>
              <li>Adempiere obblighi legali e fiscali (obbligo legale).</li>
              <li>Prevenire abusi e garantire la sicurezza (legittimo interesse).</li>
              <li>Comunicazioni di servizio essenziali (contratto/legittimo interesse).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">Conservazione</h2>
            <p>
              Conserviamo i dati per il tempo necessario a fornire il servizio e a rispettare
              gli obblighi di legge. I dati di account sono conservati finche l&apos;account e&apos;
              attivo; i dati fiscali sono conservati secondo i termini previsti dalla normativa.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">Destinatari</h2>
            <p>
              I dati possono essere condivisi con fornitori di servizi (hosting, email, storage,
              pagamento) che agiscono come responsabili del trattamento. Non vendiamo i tuoi dati.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">Diritti dell&apos;utente</h2>
            <p>
              Puoi richiedere accesso, rettifica, cancellazione, limitazione, portabilita e
              opposizione scrivendo a privacy@obaldi.it. Hai diritto di reclamo al Garante per la
              Protezione dei Dati Personali.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">Cookie e strumenti di analisi</h2>
            <p>
              Utilizziamo cookie tecnici necessari al funzionamento del sito e strumenti di analisi
              in forma aggregata per migliorare l&apos;esperienza. Per dettagli aggiuntivi puoi
              contattarci.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
