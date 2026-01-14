import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Background Elements - più sottili e moderni */}
      <div className="pointer-events-none absolute -top-40 right-[-15%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#0b224e]/8 to-[#0b224e]/3 blur-[120px]" />
      <div className="pointer-events-none absolute top-[40%] left-[-15%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#a41f2e]/8 to-[#a41f2e]/3 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-20%] right-[15%] h-[450px] w-[450px] rounded-full bg-gradient-to-tl from-[#0b224e]/6 to-transparent blur-[120px]" />

      <main className="container-max page-pad">
        {/* HERO SECTION - Immagine come sfondo */}
        <section className="relative min-h-[90vh] flex items-center pt-28 md:pt-32 pb-32 overflow-hidden rounded-[40px]">
          <div className="absolute inset-0">
            <Image
              src="/media/Hero_Home.png"
              alt="Obaldi"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-white/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent" />

          <div className="relative z-10 w-full max-w-3xl space-y-8 animate-fade-up px-6 md:px-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-[#0b224e] animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-600">
                La spesa online che ti rispetta
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-display font-bold text-[#0b224e] leading-[1.1] tracking-tight">
              Obaldi
              <span className="block text-4xl md:text-5xl font-normal text-slate-600 mt-4">
                La spesa online, facile e sicura.
              </span>
            </h1>

            <p className="text-2xl text-slate-700 leading-relaxed font-light">
              Prodotti reali. Prezzi giusti. Persone vere che ti aiutano.
            </p>

            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
              Con Obaldi, compri solo se vuoi farlo davvero. E sai sempre cosa stai comprando.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/marketplace"
                className="group px-8 py-4 rounded-full bg-[#0b224e] text-white font-semibold shadow-lg shadow-[#0b224e]/20 hover:shadow-xl hover:shadow-[#0b224e]/30 hover:scale-105 transition-all duration-300"
              >
                Entra nel Marketplace
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="#come-funziona"
                className="px-8 py-4 rounded-full bg-white text-[#0b224e] font-semibold border-2 border-slate-200 hover:border-[#0b224e] hover:shadow-lg transition-all duration-300"
              >
                Come funziona
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#0b224e]">100%</div>
                <div className="text-sm text-slate-600 mt-1">Trasparenza</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#0b224e]">0</div>
                <div className="text-sm text-slate-600 mt-1">Costi nascosti</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#0b224e]">24/7</div>
                <div className="text-sm text-slate-600 mt-1">Supporto reale</div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 right-8 max-w-[280px] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-[#0b224e]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">✓</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                A tutti è capitato di comprare qualcosa online e rimanere delusi.
              </p>
            </div>
          </div>

          <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 px-6 py-4">
            <p className="text-sm font-semibold text-[#0b224e]">Nessuna pressione. Solo chiarezza.</p>
          </div>
        </section>

        {/* Value Props - Design a cards */}
        <section className="py-24">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-[#0b224e]/20 hover:-translate-y-1">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0b224e] to-[#0b224e]/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold text-[#0b224e] mb-3">Prodotti reali</h3>
              <p className="text-slate-600 leading-relaxed">Spiegati con onestà, senza fantasie o promesse gonfiate.</p>
            </div>
            
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-[#0b224e]/20 hover:-translate-y-1">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0b224e] to-[#0b224e]/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-[#0b224e] mb-3">Prezzi giusti</h3>
              <p className="text-slate-600 leading-relaxed">Senza costi nascosti o markup esagerati sul marketing.</p>
            </div>
            
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-[#0b224e]/20 hover:-translate-y-1">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0b224e] to-[#0b224e]/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-[#0b224e] mb-3">Persone vere</h3>
              <p className="text-slate-600 leading-relaxed">Al tuo fianco ogni giorno, pronte ad aiutarti davvero.</p>
            </div>
          </div>
        </section>

        {/* Why Section - Layout migliorato */}
        <section className="py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl p-10 shadow-xl border border-slate-200/50">
              <div className="inline-block px-4 py-2 rounded-full bg-[#0b224e]/5 text-xs font-semibold tracking-wider uppercase text-[#0b224e] mb-6">
                Perché Obaldi
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] mb-6 leading-tight">
                Obaldi nasce proprio da qui.
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  A tutti è capitato almeno una volta di comprare qualcosa online che poi si è rivelato un acquisto completamente deludente.
                </p>
                <p>
                  Un prodotto che, una volta arrivato, era molto lontano da come ci era stato raccontato.
                  Non per un errore di scelta, ma per promesse gonfiate e aspettative costruite per giustificare il prezzo stesso del prodotto.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200/50 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold text-[#0b224e] mb-4">Dal desiderio di fare diverso</h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start gap-3">
                    <span className="text-[#0b224e] mt-1">✗</span>
                    <span>Non vogliamo creare aspettative irrealistiche</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#0b224e] mt-1">✗</span>
                    <span>Non vogliamo convincerti</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#0b224e] mt-1">✗</span>
                    <span>Non vogliamo spingerti a comprare</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-[#0b224e] to-[#0b224e]/90 rounded-3xl p-8 shadow-lg text-white">
                <h3 className="text-xl font-semibold mb-4">Ti mostriamo la realtà</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="mt-1">✓</span>
                    <span>Il prodotto per quello che è davvero</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1">✓</span>
                    <span>Senza raccontare fantasie</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1">✓</span>
                    <span>Poi scegli tu, con tranquillità</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section - Design più impattante */}
        <section className="py-24 bg-gradient-to-br from-slate-50 to-white rounded-[60px] my-24">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-display font-bold text-[#0b224e] mb-6">
                La vera missione di Obaldi
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Non devi venire solo per acquistare. Obaldi nasce prima di tutto per difendere le persone dagli acquisti online sbagliati e dalle truffe.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-200/50">
                <div className="h-16 w-16 rounded-2xl bg-[#a41f2e]/10 flex items-center justify-center mb-6">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-2xl font-semibold text-[#0b224e] mb-4">Il problema</h3>
                <div className="space-y-3 text-slate-600">
                  <p>Ogni giorno, solo in Italia, migliaia di spedizioni arrivano a destinazione lasciando le persone insoddisfatte:</p>
                  <ul className="space-y-2 pl-4">
                    <li>• Prodotti diversi dalle promesse</li>
                    <li>• Siti poco chiari</li>
                    <li>• Venditori irrintracciabili</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-[#0b224e] to-[#0b224e]/90 rounded-3xl p-10 shadow-xl text-white">
                <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4">La nostra soluzione</h3>
                <div className="space-y-3">
                  <p>Vogliamo diventare un punto di riferimento, non un semplice marketplace.</p>
                  <p className="font-semibold">Se hai un dubbio su un sito che non conosci, se un'offerta ti sembra troppo bella, se non sai se fidarti...</p>
                  <p className="text-2xl font-bold">Vieni da Obaldi.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Come Funziona Section */}
        <section id="come-funziona" className="py-24">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full bg-[#0b224e]/5 text-xs font-semibold tracking-wider uppercase text-[#0b224e] mb-6">
              Come funziona Obaldi
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-bold text-[#0b224e] mb-6">
              Semplice. Sicuro. Trasparente.
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprare online oggi è facile. Comprare bene e in modo sicuro lo è molto meno.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <div className="relative bg-white rounded-3xl p-10 shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="absolute -top-6 -right-6 h-16 w-16 rounded-2xl bg-[#0b224e] text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-semibold text-[#0b224e] mb-4 mt-4">Non ti spingiamo</h3>
              <p className="text-slate-600 mb-4">Qui nessuno ti corre dietro. Su Obaldi non trovi:</p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#0b224e]">✗</span>
                  <span>Pubblicità aggressive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0b224e]">✗</span>
                  <span>Urgenze artificiali</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0b224e]">✗</span>
                  <span>Promesse gonfiate</span>
                </li>
              </ul>
            </div>
            
            <div className="relative bg-white rounded-3xl p-10 shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="absolute -top-6 -right-6 h-16 w-16 rounded-2xl bg-[#0b224e] text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-semibold text-[#0b224e] mb-4 mt-4">Onestà totale</h3>
              <p className="text-slate-600 mb-4">Ogni prodotto su Obaldi è:</p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#0b224e]">✓</span>
                  <span>Descritto in modo chiaro</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0b224e]">✓</span>
                  <span>Spiegato senza esagerazioni</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0b224e]">✓</span>
                  <span>Proposto al valore reale</span>
                </li>
              </ul>
            </div>
            
            <div className="relative bg-white rounded-3xl p-10 shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="absolute -top-6 -right-6 h-16 w-16 rounded-2xl bg-[#0b224e] text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-semibold text-[#0b224e] mb-4 mt-4">Prezzi reali</h3>
              <p className="text-slate-600 mb-4">Prezzi bassi perché:</p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#0b224e]">✓</span>
                  <span>Zero pubblicità sui prodotti</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0b224e]">✓</span>
                  <span>Meno intermediari</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0b224e]">✓</span>
                  <span>Diretti alla fonte</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-24 bg-gradient-to-br from-[#0b224e] to-[#0b224e]/90 rounded-[60px] text-white my-24">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-display font-bold mb-6">
                Qui non sei mai solo
              </h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Un team di persone reali ti aiuta negli acquisti online, anche fuori dalla piattaforma.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20">
                <h3 className="text-2xl font-semibold mb-6">Ti aiutiamo quando</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🔍</span>
                    <span>Vuoi acquistare da un sito che non conosci</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">❓</span>
                    <span>Hai dubbi su un'offerta trovata online</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <span>Temi una possibile truffa</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <span>Vuoi capire se un prezzo è conveniente</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20">
                <h3 className="text-2xl font-semibold mb-6">Analizziamo per te</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <span>Affidabilità del sito</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <span>Segnali di rischio</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <span>Coerenza delle promesse</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <span>Condizioni di vendita</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 text-center bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20">
              <p className="text-2xl font-semibold mb-4">La nostra priorità non è trattenerti</p>
              <p className="text-xl opacity-90 mb-6">È aiutarti a fare la scelta giusta.</p>
              <p className="text-lg opacity-80">
                Se troviamo per te un sito più sicuro o un prezzo migliore, te lo diciamo. Con trasparenza.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-white to-slate-50/50 rounded-[60px] p-16 shadow-2xl border border-slate-200/50">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] mb-6">
              Quando comprare su Obaldi
            </h2>
            <p className="text-xl text-slate-600 mb-8">Vieni da noi quando:</p>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-2xl bg-[#0b224e]/10 flex items-center justify-center mb-3">
                  <span className="text-3xl">✓</span>
                </div>
                <p className="text-slate-700 font-medium">Un prodotto ti serve davvero</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-2xl bg-[#0b224e]/10 flex items-center justify-center mb-3">
                  <span className="text-3xl">💎</span>
                </div>
                <p className="text-slate-700 font-medium">Vuoi pagare il giusto</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-2xl bg-[#0b224e]/10 flex items-center justify-center mb-3">
                  <span className="text-3xl">🛡️</span>
                </div>
                <p className="text-slate-700 font-medium">Cerchi trasparenza</p>
              </div>
            </div>
            
            <p className="text-lg text-slate-600 mb-8">
              Obaldi non vuole essere l'unico posto dove compri.<br />
              <span className="font-semibold text-[#0b224e]">Vuole essere il posto dove ti senti al sicuro.</span>
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/membership"
                className="group px-10 py-5 rounded-full bg-[#0b224e] text-white font-semibold text-lg shadow-lg shadow-[#0b224e]/20 hover:shadow-xl hover:shadow-[#0b224e]/30 hover:scale-105 transition-all duration-300"
              >
                Entra in Obaldi
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/news"
                className="px-10 py-5 rounded-full bg-white text-[#0b224e] font-semibold text-lg border-2 border-slate-200 hover:border-[#0b224e] hover:shadow-lg transition-all duration-300"
              >
                Leggi le news anti-truffa
              </Link>
            </div>
          </div>
        </section>

        {/* Final Message */}
        <section className="py-16 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-2xl text-slate-700 font-light leading-relaxed">
              Se hai un dubbio, vieni da Obaldi,<br />
              <span className="font-semibold text-[#0b224e]">il tuo unico alleato per gli acquisti Online.</span>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
