import Image from "next/image";
import Link from "next/link";
import {
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaChartLine,
  FaLightbulb,
  FaFrown,
  FaBullseye,
  FaTimes,
  FaCheck,
  FaShieldAlt,
  FaBook,
  FaCommentDots,
  FaStar,
  FaBalanceScale,
  FaSearch,
  FaArrowRight
} from "react-icons/fa";

export default function ChiSiamo() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Background Elements */}
      <div className="pointer-events-none absolute -top-40 right-[-15%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#0b224e]/8 to-[#0b224e]/3 blur-[120px]" />
      <div className="pointer-events-none absolute top-[60%] left-[-15%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#a41f2e]/8 to-[#a41f2e]/3 blur-[120px]" />

      <main className="container-max page-pad">
        {/* Hero Section - Redesigned */}
        <section className="min-h-[40vh] md:min-h-[50vh] flex items-center pt-32 md:pt-40 pb-16 relative">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-up">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#0b224e]/5 border border-[#0b224e]/10">
                <FaShieldAlt className="text-[#0b224e]" />
                <span className="text-sm font-semibold tracking-wider uppercase text-[#0b224e]">
                  La nostra storia
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-[#0b224e] leading-[1.1] tracking-tight">
                Chi siamo
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light max-w-xl">
                Un team di professionisti che ha scelto di fare impresa partendo dall'esperienza reale, vissuta sulla propria pelle.
              </p>

              <div className="flex items-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#0b224e]">10+</div>
                  <div className="text-sm text-slate-500">Anni di esperienza</div>
                </div>
                <div className="h-12 w-px bg-slate-200" />
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#0b224e]">100%</div>
                  <div className="text-sm text-slate-500">Trasparenza</div>
                </div>
                <div className="h-12 w-px bg-slate-200" />
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#0b224e]">0</div>
                  <div className="text-sm text-slate-500">Pubblicità aggressive</div>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0b224e]/10 to-[#a41f2e]/10 rounded-[40px] blur-3xl" />
              <div className="relative bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-[#0b224e] flex items-center justify-center">
                      <FaShieldAlt className="text-2xl text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-[#0b224e]">Tutela</div>
                      <div className="text-sm text-slate-500">Il nostro valore fondante</div>
                    </div>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <p className="text-slate-600 leading-relaxed">
                    Ogni giorno lavoriamo per proteggere le persone dalle insidie degli acquisti online. Non vendiamo promesse, offriamo sicurezza.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* L'Esperienza - Timeline Style */}
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="group relative bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="h-14 w-14 rounded-2xl bg-[#a41f2e]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FaExclamationTriangle className="text-2xl text-[#a41f2e]" />
                </div>
                <h3 className="text-xl font-bold text-[#0b224e] mb-3">Promesse esagerate</h3>
                <p className="text-slate-600 leading-relaxed">
                  Prodotti "pompati" nel marketing che non mantengono mai le aspettative create.
                </p>
              </div>

              {/* Card 2 */}
              <div className="group relative bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="h-14 w-14 rounded-2xl bg-[#a41f2e]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FaMoneyBillWave className="text-2xl text-[#a41f2e]" />
                </div>
                <h3 className="text-xl font-bold text-[#0b224e] mb-3">Prezzi ingannevoli</h3>
                <p className="text-slate-600 leading-relaxed">
                  Costi che non rispecchiano il valore o l'utilità reale del prodotto.
                </p>
              </div>

              {/* Card 3 */}
              <div className="group relative bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="h-14 w-14 rounded-2xl bg-[#a41f2e]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FaChartLine className="text-2xl text-[#a41f2e]" />
                </div>
                <h3 className="text-xl font-bold text-[#0b224e] mb-3">Profitto a ogni costo</h3>
                <p className="text-slate-600 leading-relaxed">
                  Meccanismi studiati per massimizzare i profitti a discapito di chi acquista.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* La Consapevolezza - Large Feature */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-[#0b224e] to-[#1a3a6e] rounded-[48px] p-12 md:p-16 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#a41f2e]/20 rounded-full blur-3xl" />

              <div className="relative grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
                    <FaLightbulb className="text-amber-400" />
                    <span className="text-sm font-semibold">La consapevolezza</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
                    Prima di tutto, siamo stati clienti
                  </h2>
                  <p className="text-lg opacity-90 leading-relaxed mb-6">
                    E come molti, siamo stati anche vittime di acquisti sbagliati, di fiducia mal riposta, di soldi persi senza alcuna reale tutela.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold mb-4">La verità che abbiamo scoperto</h3>
                  <p className="text-lg opacity-95 leading-relaxed">
                    Per una persona, 50 o 100 euro non sono "solo" una cifra. Possono essere un sacrificio, un regalo importante, una scelta fatta con attenzione in un contesto in cui la stabilità economica non è sempre garantita.
                  </p>
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <p className="text-xl font-semibold">
                      Quando quell'acquisto si rivela inutile o ingannevole, il danno non è solo economico, <span className="text-amber-400">ma anche umano.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Il Punto di Rottura */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] mb-4">
                Il punto di rottura
              </h2>
              <p className="text-xl text-slate-600">Da questa consapevolezza nasce la nostra visione</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Stanchezza */}
              <div className="bg-white rounded-3xl p-10 shadow-xl border border-[#a41f2e]/20 hover:shadow-2xl transition-shadow">
                <div className="h-16 w-16 rounded-2xl bg-[#a41f2e]/10 flex items-center justify-center mb-6">
                  <FaFrown className="text-3xl text-[#a41f2e]" />
                </div>
                <h3 className="text-2xl font-bold text-[#0b224e] mb-6">Ci siamo stancati di</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <FaTimes className="text-[#a41f2e] mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Vedere le persone trattate come numeri</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaTimes className="text-[#a41f2e] mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Un sistema che premia chi vende meglio, non chi vende in modo corretto</span>
                  </li>
                </ul>
              </div>

              {/* Decisione */}
              <div className="bg-white rounded-3xl p-10 shadow-xl border border-[#0b224e]/20 hover:shadow-2xl transition-shadow">
                <div className="h-16 w-16 rounded-2xl bg-[#0b224e]/10 flex items-center justify-center mb-6">
                  <FaBullseye className="text-3xl text-[#0b224e]" />
                </div>
                <h3 className="text-2xl font-bold text-[#0b224e] mb-6">Abbiamo deciso di</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <FaCheck className="text-[#0b224e] mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Tutelare ogni persona negli acquisti online</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheck className="text-[#0b224e] mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Offrire supporto e orientamento concreto</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Nasce Obaldi */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-[48px] p-12 md:p-16 shadow-2xl border border-slate-200/50">
              <div className="text-center mb-12">
                <div className="inline-flex h-20 w-20 rounded-3xl bg-[#0b224e] items-center justify-center mb-6 shadow-lg shadow-[#0b224e]/20">
                  <FaShieldAlt className="text-4xl text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] mb-4">
                  Nasce OBALDI
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Un progetto pensato per offrire supporto, orientamento e un punto di riferimento concreto
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 text-center hover:shadow-xl transition-shadow">
                  <div className="h-14 w-14 rounded-xl bg-[#0b224e]/10 flex items-center justify-center mx-auto mb-4">
                    <FaBook className="text-2xl text-[#0b224e]" />
                  </div>
                  <h4 className="font-bold text-[#0b224e] mb-2">Dall'esperienza</h4>
                  <p className="text-sm text-slate-600">Anni di lavoro nel settore delle vendite online</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 text-center hover:shadow-xl transition-shadow">
                  <div className="h-14 w-14 rounded-xl bg-[#0b224e]/10 flex items-center justify-center mx-auto mb-4">
                    <FaCommentDots className="text-2xl text-[#0b224e]" />
                  </div>
                  <h4 className="font-bold text-[#0b224e] mb-2">Dagli errori</h4>
                  <p className="text-sm text-slate-600">Vissuti in prima persona come clienti</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 text-center hover:shadow-xl transition-shadow">
                  <div className="h-14 w-14 rounded-xl bg-[#0b224e]/10 flex items-center justify-center mx-auto mb-4">
                    <FaStar className="text-2xl text-[#0b224e]" />
                  </div>
                  <h4 className="font-bold text-[#0b224e] mb-2">Dalla volontà</h4>
                  <p className="text-sm text-slate-600">Di fare le cose in modo diverso</p>
                </div>
              </div>

              <div className="mt-10 bg-[#0b224e]/5 rounded-2xl p-8 text-center">
                <p className="text-lg text-[#0b224e] font-medium">
                  Con rispetto, responsabilità e attenzione reale verso le persone.<br />
                  <span className="opacity-70">Per tutte quelle persone che, prima di un acquisto online, non sanno a chi affidarsi.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Il Nostro Obiettivo */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] mb-4">
                Il nostro obiettivo
              </h2>
              <p className="text-xl text-slate-600 max-w-4xl mx-auto">
                Contribuire alla costruzione di un contesto in cui gli acquisti online possano avvenire in modo più sicuro, consapevole e sereno
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100">
                <div className="h-16 w-16 rounded-2xl bg-[#0b224e]/10 flex items-center justify-center mb-6">
                  <FaBullseye className="text-3xl text-[#0b224e]" />
                </div>
                <h3 className="text-2xl font-bold text-[#0b224e] mb-6">Cosa facciamo</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <FaArrowRight className="text-[#0b224e] mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Offriamo supporto e orientamento su come valutare acquisti online</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaArrowRight className="text-[#0b224e] mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Aiutiamo a individuare potenziali criticità</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaArrowRight className="text-[#0b224e] mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Riduciamo il rischio di scelte non consapevoli</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaArrowRight className="text-[#0b224e] mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Riduciamo l'incertezza e il timore legati agli acquisti online</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100">
                <div className="h-16 w-16 rounded-2xl bg-[#a41f2e]/10 flex items-center justify-center mb-6">
                  <FaShieldAlt className="text-3xl text-[#a41f2e]" />
                </div>
                <h3 className="text-2xl font-bold text-[#0b224e] mb-6">Cosa preveniamo</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <FaTimes className="text-[#a41f2e] mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Situazioni di pressione commerciale</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaTimes className="text-[#a41f2e] mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Acquisti impulsivi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaTimes className="text-[#a41f2e] mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Acquisti potenzialmente rischiosi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaTimes className="text-[#a41f2e] mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Decisioni non informate</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Principio Chiaro */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#0b224e] to-[#1a3a6e] rounded-[48px] p-12 md:p-16 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/media/pattern.svg')] opacity-5" />
              <div className="relative">
                <div className="inline-flex h-20 w-20 rounded-3xl bg-white/20 items-center justify-center mb-8">
                  <FaBalanceScale className="text-4xl" />
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                  Il nostro principio chiaro
                </h2>
                <p className="text-2xl md:text-3xl font-light mb-8 leading-relaxed">
                  Non incentivare l'acquisto,<br />
                  <span className="font-semibold">ma favorire decisioni informate</span>
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <p className="text-lg opacity-95">
                    La decisione finale di acquistare o meno resta sempre personale. Il nostro ruolo è fornire elementi utili alla valutazione, affinché ogni scelta possa essere presa con maggiore consapevolezza e tranquillità.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visione */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] mb-4">
                La visione di OBALDI
              </h2>
              <p className="text-xl text-slate-600 max-w-4xl mx-auto">
                Sviluppare un ecosistema di supporto e tutela per offrire un punto di riferimento affidabile in un contesto digitale complesso
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100">
                <div className="h-16 w-16 rounded-2xl bg-[#0b224e]/10 flex items-center justify-center mb-6">
                  <FaSearch className="text-3xl text-[#0b224e]" />
                </div>
                <h3 className="text-2xl font-bold text-[#0b224e] mb-6">Fondato su</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-slate-700">
                    <div className="h-2 w-2 rounded-full bg-[#0b224e]" />
                    Analisi dei fattori di rischio
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <div className="h-2 w-2 rounded-full bg-[#0b224e]" />
                    Esperienza maturata nel tempo
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <div className="h-2 w-2 rounded-full bg-[#0b224e]" />
                    Competenza nel settore
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100">
                <div className="h-16 w-16 rounded-2xl bg-[#0b224e]/10 flex items-center justify-center mb-6">
                  <FaBullseye className="text-3xl text-[#0b224e]" />
                </div>
                <h3 className="text-2xl font-bold text-[#0b224e] mb-6">Orientato a</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-slate-700">
                    <div className="h-2 w-2 rounded-full bg-[#0b224e]" />
                    Promuovere approccio responsabile
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <div className="h-2 w-2 rounded-full bg-[#0b224e]" />
                    Fornire informazioni necessarie
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <div className="h-2 w-2 rounded-full bg-[#0b224e]" />
                    Garantire scelte consapevoli
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Finalità - Numbered Steps */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] text-center mb-16">
              La nostra finalità
            </h2>

            <div className="space-y-6">
              {[
                { num: 1, title: "Supportare e tutelare", desc: "Le persone nelle scelte di acquisto online" },
                { num: 2, title: "Fornire informazioni", desc: "Necessarie per valutare correttamente ogni prodotto" },
                { num: 3, title: "Garantire consapevolezza", desc: "Così che la decisione finale sia sempre consapevole e informata" }
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-6 bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
                  <div className="h-16 w-16 rounded-2xl bg-[#0b224e] text-white flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                    {item.num}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0b224e] mb-2">{item.title}</h3>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA finale */}
        <section className="py-24 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-50 to-white rounded-[48px] p-12 md:p-16 shadow-2xl border border-slate-200/50">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#0b224e] mb-6">
              Unisciti a noi
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto">
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
