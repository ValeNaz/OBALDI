export default function ContattiPage() {
  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-20">
      <div className="glass-card card-pad max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[#0b224e] mb-6">
          Contatti
        </h1>
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <div>
            <p>Per richieste, dubbi o segnalazioni puoi scriverci a:</p>
            <p className="text-lg font-semibold text-[#0b224e]">supporto@obaldi.it</p>
          </div>

          <div>
            <p>Assistenza acquisti (Tutela):</p>
            <p className="text-lg font-semibold text-[#0b224e]">assistenza@obaldi.it</p>
          </div>

          <div>
            <p>Privacy:</p>
            <p className="text-lg font-semibold text-[#0b224e]">privacy@obaldi.it</p>
          </div>

          <div>
            <p>Orari di supporto:</p>
            <p>Lun - Ven, 9:00 - 18:00 (CET)</p>
          </div>

          <div className="pt-4 border-t border-slate-200/60">
            <p className="font-semibold text-[#0b224e]">Dati societari</p>
            <p>[RAGIONE SOCIALE]</p>
            <p>P.IVA [P.IVA]</p>
            <p>[INDIRIZZO COMPLETO]</p>
          </div>
        </div>
      </div>
    </div>
  );
}
