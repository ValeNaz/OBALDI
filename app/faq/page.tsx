export default function FaqPage() {
  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-20">
      <div className="glass-card card-pad max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[#0b224e] mb-6">
          FAQ
        </h1>
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">Che cos&apos;e Obaldi?</h2>
            <p>
              Obaldi e&apos; una piattaforma con membership che offre prodotti selezionati e contenuti
              per riconoscere truffe online.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">
              Posso acquistare senza membership?
            </h2>
            <p>
              No. La navigazione e&apos; libera, ma gli acquisti sono riservati ai membri con
              membership attiva.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">Qual e&apos; la differenza tra piani?</h2>
            <p>
              Il piano Premium (Tutela) include punti utilizzabili per alcuni prodotti e la
              possibilita di richiedere assistenza acquisti.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">Come funzionano i punti?</h2>
            <p>
              1 punto equivale a 1 euro. I punti sono utilizzabili per prodotti idonei e possono
              coprire una parte o il totale dell&apos;importo.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">Quanto dura la membership?</h2>
            <p>
              La membership ha rinnovo automatico ogni 28 giorni, con possibilita di disattivarla
              in qualsiasi momento.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">
              La spedizione e&apos; inclusa?
            </h2>
            <p>
              Si, per tutti i membri la spedizione e&apos; sempre inclusa nel prezzo del prodotto.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b224e] mb-2">Come richiedo un reso?</h2>
            <p>
              Puoi consultare la pagina &quot;Resi e rimborsi&quot; e contattare il supporto per aprire
              una richiesta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
