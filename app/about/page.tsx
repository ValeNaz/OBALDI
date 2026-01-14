import Image from "next/image";
import Link from "next/link";

export default function ChiSiamo() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Background Elements */}
      <div className="pointer-events-none absolute -top-40 right-[-15%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#0b224e]/8 to-[#0b224e]/3 blur-[120px]" />
      <div className="pointer-events-none absolute top-[60%] left-[-15%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#a41f2e]/8 to-[#a41f2e]/3 blur-[120px]" />

      <main className="container-max page-pad">
        {/* Hero Section */}
        <section className="min-h-[70vh] flex items-center justify-center pt-20 pb-32">
          <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-[#0b224e] animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-600">
                La nostra storia
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-[#0b224e] leading-[1.1] tracking-tight">
              Chi siamo
            </h1>
            
            <p className="text-2xl md:text-3xl text-slate-600 leading-relaxed font-light max-w-4xl mx-auto">
              Un team di professionisti che ha scelto di fare impresa partendo dall'esperienza reale, vissuta sulla propria pelle.
            </p>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-24 max-w-6xl mx-auto">
          <div className="space-y-16">
            {/* Esperienza */}
            <div className="grid lg:grid-cols-[1fr_2fr] gap-12 items-start">
              <div className="lg:sticky lg:top-24">
                <div className="inline-block px-6 py-3 rounded-full bg-[#0b224e] text-white font-semibold shadow-lg">
                  10+ anni
                </div>
                <h2 className="text-4xl font-display font-bold text-[#0b224e] mt-6">
                  L'esperienza
                </h2>
              </div>
              
              <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-200/50">
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  Per oltre dieci anni abbiamo lavorato nel mondo delle vendite online. In questo percorso abbiamo visto da vicino quanto sia facile ingannare i consumatori:
                </p>
                <ul className="space-y-4 text-slate-600">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl text-[#a41f2e]">⚠️</span>
                    <span>Promesse esagerate e prodotti "pompati" nel marketing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl text-[#a41f2e]">💸</span>
                    <span>Prezzi che non rispecchiano il valore o l'utilità reale</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl text-[#a41f2e]">📊</span>
                    <span>Meccanismi studiati per massimizzare i profitti a discapito di chi acquista</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Consapevolezza */}
            <div className="grid lg:grid-cols-[2fr_1fr] gap-12 items-start">
              <div className="bg-gradient-to-br from-[#0b224e] to-[#0b224e]/90 rounded-3xl p-10 shadow-xl text-white">
                <h3 className="text-3xl font-display font-bold mb-6">Prima di tutto, siamo stati clienti</h3>
                <p className="text-lg leading-relaxed mb-6 opacity-95">
                  E come molti, siamo stati anche vittime di acquisti sbagliati, di fiducia mal riposta, di soldi persi senza alcuna reale tutela.
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <p className="text-xl font-semibold mb-3">La verità che abbiamo scoperto</p>
                  <p className="opacity-90">
                    Per una persona, 50 o 100 euro non sono "solo" una cifra. Possono essere un sacrificio, un regalo importante, una scelta fatta con attenzione in un contesto in cui la stabilità economica non è sempre garantita.
                  </p>
                </div>
              </div>
              
              <div className="lg:sticky lg:top-24">
                <div className="h-16 w-16 rounded-2xl bg-[#a41f2e]/10 flex items-center justify-center mb-4">
                  <span className="text-3xl">💡</span>
                </div>
                <h2 className="text-4xl font-display font-bold text-[#0b224e]">
                  La consapevolezza
                </h2>
              </div>
            </div>

            {/* Il danno */}
            <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl p-10 shadow-xl border border-slate-200/50 text-center max-w-4xl mx-auto">
              <p className="text-2xl text-slate-700 font-semibold mb-4">
                Quando quell'acquisto si rivela inutile o ingannevole
              </p>
              <p className="text-xl text-slate-600 leading-relaxed">
                Il danno non è solo economico, <span className="text-[#0b224e] font-semibold">ma anche umano.</span>
              </p>
            </div>
          </div>
        </section>

        {/* Stanchezza del sistema */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-[60px] p-16 shadow-2xl border border-slate-200/50">
              <div className="text-center mb-12">
                <h2 className="text-5xl md:text-6xl font-display font-bold text-[#0b224e] mb-6">
                  Il punto di rottura
                </h2>
                <p className="text-2xl text-slate-600 font-light">
                  Da questa consapevolezza nasce la nostra visione
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="bg-[#a41f2e]/5 rounded-3xl p-8 border-2 border-[#a41f2e]/20">
                  <div className="h-14 w-14 rounded-2xl bg-[#a41f2e]/10 flex items-center justify-center mb-4">
                    <span className="text-3xl">😔</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#0b224e] mb-4">Ci siamo stancati di</h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-[#a41f2e] font-bold">✗</span>
                      <span>Vedere le persone trattate come numeri</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#a41f2e] font-bold">✗</span>
                      <span>Un sistema che premia chi vende meglio, non chi vende in modo corretto</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-[#0b224e]/5 rounded-3xl p-8 border-2 border-[#0b224e]/20">
                  <div className="h-14 w-14 rounded-2xl bg-[#0b224e]/10 flex items-center justify-center mb-4">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#0b224e] mb-4">Abbiamo deciso di</h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-[#0b224e] font-bold">✓</span>
                      <span>Tutelare ogni persona negli acquisti online</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#0b224e] font-bold">✓</span>
                      <span>Offrire supporto e orientamento concreto</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nasce Obaldi */}
        <section className="py-24 bg-gradient-to-br from-[#0b224e] to-[#0b224e]/90 rounded-[60px] text-white my-24">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <div className="inline-block h-20 w-20 rounded-3xl bg-white/20 flex items-center justify-center mb-6">
                <span className="text-5xl">🛡️</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-display font-bold mb-6">
                Nasce OBALDI
              </h2>
              <p className="text-2xl opacity-95 max-w-3xl mx-auto leading-relaxed">
                Un progetto pensato per offrire supporto, orientamento e un punto di riferimento concreto
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-semibold mb-3">Dall'esperienza</h3>
                <p className="opacity-90">Anni di lavoro nel settore delle vendite online</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="text-4xl mb-4">💭</div>
                <h3 className="text-xl font-semibold mb-3">Dagli errori</h3>
                <p className="opacity-90">Vissuti in prima persona come clienti</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-semibold mb-3">Dalla volontà</h3>
                <p className="opacity-90">Di fare le cose in modo diverso</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20 text-center">
              <p className="text-2xl font-semibold mb-4">Con rispetto, responsabilità e attenzione reale verso le persone</p>
              <p className="text-lg opacity-90">
                Per tutte quelle persone che, prima di un acquisto online, non sanno a chi affidarsi.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Obiettivo */}
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-display font-bold text-[#0b224e] mb-6">
                Il nostro obiettivo
              </h2>
              <p className="text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                Contribuire alla costruzione di un contesto in cui gli acquisti online possano avvenire in modo più sicuro, consapevole e sereno
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-200/50">
                <div className="h-16 w-16 rounded-2xl bg-[#0b224e]/10 flex items-center justify-center mb-6">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-semibold text-[#0b224e] mb-6">Cosa facciamo</h3>
                <ul className="space-y-4 text-slate-600">
                  <li className="flex items-start gap-3">
                    <span className="text-[#0b224e] text-xl">→</span>
                    <span>Offriamo supporto e orientamento su come valutare acquisti online</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#0b224e] text-xl">→</span>
                    <span>Aiutiamo a individuare potenziali criticità</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#0b224e] text-xl">→</span>
                    <span>Riduciamo il rischio di scelte non consapevoli</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#0b224e] text-xl">→</span>
                    <span>Riduciamo l'incertezza e il timore legati agli acquisti online</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-200/50">
                <div className="h-16 w-16 rounded-2xl bg-[#0b224e]/10 flex items-center justify-center mb-6">
                  <span className="text-3xl">🚫</span>
                </div>
                <h3 className="text-2xl font-semibold text-[#0b224e] mb-6">Cosa preveniamo</h3>
                <ul className="space-y-4 text-slate-600">
                  <li className="flex items-start gap-3">
                    <span className="text-[#a41f2e] text-xl">✗</span>
                    <span>Situazioni di pressione commerciale</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#a41f2e] text-xl">✗</span>
                    <span>Acquisti impulsivi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#a41f2e] text-xl">✗</span>
                    <span>Acquisti potenzialmente rischiosi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#a41f2e] text-xl">✗</span>
                    <span>Decisioni non informate</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Principio chiaro */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-[60px] p-16 shadow-2xl border-2 border-[#0b224e]/10 text-center">
              <div className="inline-block h-24 w-24 rounded-3xl bg-[#0b224e]/10 flex items-center justify-center mb-8">
                <span className="text-5xl">⚖️</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] mb-6">
                Il nostro principio chiaro
              </h2>
              <p className="text-3xl text-slate-700 font-semibold mb-8 leading-relaxed">
                Non incentivare l'acquisto,<br />
                ma favorire decisioni informate
              </p>
              <div className="bg-white rounded-3xl p-8 border border-slate-200/50 max-w-3xl mx-auto">
                <p className="text-xl text-slate-600 leading-relaxed mb-4">
                  La decisione finale di acquistare o meno resta sempre personale.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Il nostro ruolo è fornire elementi utili alla valutazione, affinché ogni scelta possa essere presa con maggiore consapevolezza e tranquillità.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Visione */}
        <section className="py-24 bg-gradient-to-br from-[#0b224e] to-[#0b224e]/90 rounded-[60px] text-white my-24">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-display font-bold mb-6">
                La visione di OBALDI
              </h2>
              <p className="text-2xl opacity-95 max-w-4xl mx-auto leading-relaxed">
                Sviluppare un ecosistema di supporto e tutela per offrire un punto di riferimento affidabile in un contesto digitale complesso
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20">
                <div className="text-4xl mb-6">🔍</div>
                <h3 className="text-2xl font-semibold mb-4">Fondato su</h3>
                <ul className="space-y-3 text-lg opacity-95">
                  <li className="flex items-start gap-3">
                    <span>•</span>
                    <span>Analisi dei fattori di rischio</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span>•</span>
                    <span>Esperienza maturata nel tempo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span>•</span>
                    <span>Competenza nel settore</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20">
                <div className="text-4xl mb-6">🎯</div>
                <h3 className="text-2xl font-semibold mb-4">Orientato a</h3>
                <ul className="space-y-3 text-lg opacity-95">
                  <li className="flex items-start gap-3">
                    <span>•</span>
                    <span>Promuovere approccio responsabile</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span>•</span>
                    <span>Fornire informazioni necessarie</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span>•</span>
                    <span>Garantire scelte consapevoli</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Finalità */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-display font-bold text-[#0b224e] mb-12">
              La nostra finalità
            </h2>
            
            <div className="bg-white rounded-[60px] p-16 shadow-2xl border border-slate-200/50">
              <div className="space-y-8">
                <div className="flex items-start gap-6 text-left">
                  <div className="h-16 w-16 rounded-2xl bg-[#0b224e] text-white flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-[#0b224e] mb-3">Supportare e tutelare</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      Le persone nelle scelte di acquisto online
                    </p>
                  </div>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                
                <div className="flex items-start gap-6 text-left">
                  <div className="h-16 w-16 rounded-2xl bg-[#0b224e] text-white flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-[#0b224e] mb-3">Fornire informazioni</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      Necessarie per valutare correttamente ogni prodotto
                    </p>
                  </div>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                
                <div className="flex items-start gap-6 text-left">
                  <div className="h-16 w-16 rounded-2xl bg-[#0b224e] text-white flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-[#0b224e] mb-3">Garantire consapevolezza</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      Così che la decisione finale sia sempre consapevole e informata
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA finale */}
        <section className="py-24 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-50 to-white rounded-[60px] p-16 shadow-2xl border border-slate-200/50">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] mb-6">
              Unisciti a noi
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto">
              Scopri come OBALDI può aiutarti a fare acquisti online in modo più sicuro, consapevole e sereno.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/membership"
                className="group px-10 py-5 rounded-full bg-[#0b224e] text-white font-semibold text-lg shadow-lg shadow-[#0b224e]/20 hover:shadow-xl hover:shadow-[#0b224e]/30 hover:scale-105 transition-all duration-300"
              >
                Inizia ora
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/contatti"
                className="px-10 py-5 rounded-full bg-white text-[#0b224e] font-semibold text-lg border-2 border-slate-200 hover:border-[#0b224e] hover:shadow-lg transition-all duration-300"
              >
                Contattaci
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
