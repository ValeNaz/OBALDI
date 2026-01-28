import Image from "next/image";
import Link from "next/link";
import { FaCheck, FaTimes, FaShieldAlt, FaMoneyBillWave, FaUsers, FaExclamationTriangle, FaBullseye, FaSearch, FaQuestionCircle, FaLightbulb, FaStore, FaGem } from "react-icons/fa";
import { AnimatedHero } from "@/components/ui/animated-hero";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { FeatureStepsMinimal } from "@/components/ui/feature-steps-minimal";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Background Elements - più sottili e moderni */}
      <div className="hidden md:block pointer-events-none absolute -top-40 right-[-15%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#0b224e]/8 to-[#0b224e]/3 blur-3xl opacity-60" />
      <div className="hidden md:block pointer-events-none absolute top-[40%] left-[-15%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#a41f2e]/8 to-[#a41f2e]/3 blur-3xl opacity-60" />
      <div className="hidden md:block pointer-events-none absolute bottom-[-20%] right-[15%] h-[450px] w-[450px] rounded-full bg-gradient-to-tl from-[#0b224e]/6 to-transparent blur-3xl opacity-60" />

      <main className="container-max page-pad">
        {/* HERO SECTION - Animated */}
        <section className="pt-12 md:pt-16">
          <AnimatedHero />
        </section>

        {/* Value Props - Design a cards */}
        <section className="py-24">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <SpotlightCard className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-[#0b224e]/20 hover:-translate-y-1">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0b224e] to-[#0b224e]/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaShieldAlt className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#0b224e] mb-3">Prodotti reali</h3>
              <p className="text-slate-600 leading-relaxed">Spiegati con onestà, senza fantasie o promesse gonfiate.</p>
            </SpotlightCard>

            <SpotlightCard className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-[#0b224e]/20 hover:-translate-y-1">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0b224e] to-[#0b224e]/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaMoneyBillWave className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#0b224e] mb-3">Prezzi giusti</h3>
              <p className="text-slate-600 leading-relaxed">Senza costi nascosti o markup esagerati sul marketing.</p>
            </SpotlightCard>

            <SpotlightCard className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-[#0b224e]/20 hover:-translate-y-1">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0b224e] to-[#0b224e]/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaUsers className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#0b224e] mb-3">Persone vere</h3>
              <p className="text-slate-600 leading-relaxed">Al tuo fianco ogni giorno, pronte ad aiutarti davvero.</p>
            </SpotlightCard>
          </div>
        </section>

        {/* Why Section - Layout migliorato */}
        <section className="py-12 md:py-24">
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
                    <FaTimes className="text-[#0b224e] mt-1 flex-shrink-0" />
                    <span>Non vogliamo creare aspettative irrealistiche</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaTimes className="text-[#0b224e] mt-1 flex-shrink-0" />
                    <span>Non vogliamo convincerti</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaTimes className="text-[#0b224e] mt-1 flex-shrink-0" />
                    <span>Non vogliamo spingerti a comprare</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#0b224e] to-[#0b224e]/90 rounded-3xl p-8 shadow-lg text-white">
                <h3 className="text-xl font-semibold mb-4">Ti mostriamo la realtà</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <FaCheck className="mt-1 flex-shrink-0" />
                    <span>Il prodotto per quello che è davvero</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheck className="mt-1 flex-shrink-0" />
                    <span>Senza raccontare fantasie</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheck className="mt-1 flex-shrink-0" />
                    <span>Poi scegli tu, con tranquillità</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section - Design più impattante */}
        <section className="py-12 md:py-24 bg-gradient-to-br from-slate-50 to-white rounded-[40px] md:rounded-[60px] my-12 md:my-24">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-display font-bold text-[#0b224e] mb-6">
                La vera missione di Obaldi
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Non devi venire solo per acquistare. Obaldi nasce prima di tutto per difendere le persone dagli acquisti online sbagliati e dalle truffe.
              </p>
            </div>

            {/* Layout con cards a sinistra e immagine a destra */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Cards impilate */}
              <div className="space-y-6">
                {/* Card Il problema */}
                <SpotlightCard className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="flex items-start gap-5">
                    <div className="h-12 w-12 rounded-xl bg-[#a41f2e]/10 flex items-center justify-center flex-shrink-0">
                      <FaExclamationTriangle className="text-xl text-[#a41f2e]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#0b224e] mb-2">Il problema</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Ogni giorno migliaia di persone ricevono prodotti diversi dalle promesse, da siti poco chiari con venditori irrintracciabili.
                      </p>
                    </div>
                  </div>
                </SpotlightCard>

                {/* Card La nostra soluzione */}
                <div className="bg-gradient-to-br from-[#0b224e] to-[#1a3a6e] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="flex items-start gap-5">
                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <FaBullseye className="text-xl text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">La nostra soluzione</h3>
                      <p className="text-white/80 text-sm leading-relaxed mb-3">
                        Vogliamo diventare un punto di riferimento, non un semplice marketplace.
                      </p>
                      <p className="text-white font-semibold text-base">
                        Se hai un dubbio, vieni da Obaldi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Immagine */}
              <div className="relative h-[350px] md:h-[450px] lg:h-[500px] w-full group">
                <Image
                  src="/media/VerificaSito.png"
                  alt="Verifica sito Obaldi"
                  fill
                  className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Come Funziona Section */}
        <section id="come-funziona" className="py-24">
          <FeatureStepsMinimal
            title="Semplice. Sicuro. Trasparente."
            subtitle="Comprare online oggi è facile. Comprare bene e in modo sicuro lo è molto meno."
            autoPlayInterval={5000}
            image="/media/PrezzoChiaro.png"
            imageAlt="Prezzo chiaro Obaldi"
            features={[
              {
                step: "Step 1",
                title: "Non ti spingiamo",
                content: "Nessuna pubblicità aggressiva, urgenze artificiali o promesse gonfiate. Scegli tu, con calma."
              },
              {
                step: "Step 2",
                title: "Onestà totale",
                content: "Ogni prodotto è descritto chiaramente, spiegato senza esagerazioni e proposto al valore reale."
              },
              {
                step: "Step 3",
                title: "Prezzi reali",
                content: "Zero pubblicità sui prodotti, meno intermediari, diretti alla fonte. Così risparmi davvero."
              }
            ]}
          />
        </section>

        {/* Support Section - BentoGrid */}
        <section className="py-24 my-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-display font-bold text-[#0b224e] mb-6">
                Qui non sei mai solo
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Un team di persone reali ti aiuta negli acquisti online, anche fuori dalla piattaforma.
              </p>
            </div>

            <BentoGrid className="lg:grid-rows-2 max-w-5xl mx-auto">
              {/* Card 1 - Ti aiutiamo quando - Icona Rossa */}
              <BentoCard
                name="Ti aiutiamo quando"
                className="lg:row-start-1 lg:row-end-2 lg:col-start-1 lg:col-end-2"
                Icon={FaSearch}
                description="Vuoi acquistare da un sito sconosciuto, hai dubbi su un'offerta, temi una truffa o vuoi capire se un prezzo è conveniente."
                href="/contatti"
                cta="Chiedi aiuto"
                iconColor="text-rose-600"
                iconBg="bg-rose-100"
              />

              {/* Card 2 - Analizziamo per te - Icona Verde */}
              <BentoCard
                name="Analizziamo per te"
                className="lg:row-start-1 lg:row-end-2 lg:col-start-2 lg:col-end-3"
                Icon={FaShieldAlt}
                description="Affidabilità del sito, segnali di rischio, coerenza delle promesse e condizioni di vendita."
                href="/about"
                cta="Scopri di più"
                iconColor="text-emerald-600"
                iconBg="bg-emerald-100"
              />

              {/* Card 3 - Trasparenza totale - Icona Ambra */}
              <BentoCard
                name="Trasparenza totale"
                className="lg:row-start-1 lg:row-end-2 lg:col-start-3 lg:col-end-4"
                Icon={FaLightbulb}
                description="Se troviamo un sito più sicuro o un prezzo migliore, te lo diciamo."
                href="/news"
                cta="Leggi le news"
                iconColor="text-amber-600"
                iconBg="bg-amber-100"
              />

              {/* Card 4 - La nostra priorità - Icona Blu */}
              <BentoCard
                name="La nostra priorità"
                className="lg:row-start-2 lg:row-end-3 lg:col-start-1 lg:col-end-2"
                Icon={FaBullseye}
                description="Non è trattenerti, ma aiutarti a fare la scelta giusta."
                href="/about"
                cta="Chi siamo"
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
              />

              {/* Card 5 - Supporto reale - Icona Viola */}
              <BentoCard
                name="Supporto reale"
                className="lg:row-start-2 lg:row-end-3 lg:col-start-2 lg:col-end-4"
                Icon={FaUsers}
                description="Persone vere al tuo fianco, pronte ad aiutarti davvero in ogni momento. La nostra missione è essere il tuo alleato di fiducia."
                href="/contatti"
                cta="Contattaci"
                iconColor="text-violet-600"
                iconBg="bg-violet-100"
              />
            </BentoGrid>
          </div>
        </section>

        {/* News Anti-Truffa Section */}
        <section className="py-24 bg-gradient-to-br from-slate-50 to-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Immagine a sinistra */}
              <div className="relative h-[350px] md:h-[400px] w-full">
                <Image
                  src="/media/NewsAntiTruffa.png"
                  alt="News Anti Truffa - Come riconoscere i rischi"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Contenuto a destra */}
              <div>
                <div className="inline-block px-4 py-2 rounded-full bg-[#a41f2e]/10 text-xs font-semibold tracking-wider uppercase text-[#a41f2e] mb-6">
                  Risorse gratuite
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] mb-6">
                  News Anti-Truffa
                </h2>
                <p className="text-xl text-slate-600 mb-6 leading-relaxed">
                  Impara a riconoscere i rischi online. Guide pratiche, segnali d&apos;allarme e consigli per acquistare in sicurezza.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-[#a41f2e]" />
                    Come riconoscere un sito truffa
                  </li>
                  <li className="flex items-center gap-3 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-[#a41f2e]" />
                    Red flags nei prezzi troppo bassi
                  </li>
                  <li className="flex items-center gap-3 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-[#a41f2e]" />
                    Proteggere i tuoi dati di pagamento
                  </li>
                </ul>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 bg-[#0b224e] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#0b224e]/90 transition-all hover:shadow-xl hover:scale-105"
                >
                  Leggi le guide
                  <FaShieldAlt />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Valore Territorio Section */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] mb-6">
                Il valore di Obaldi per il territorio
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-200/50">
                <div className="h-14 w-14 rounded-2xl bg-[#0b224e]/10 flex items-center justify-center mb-6">
                  <FaStore className="text-2xl text-[#0b224e]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#0b224e] mb-4">
                  Supportiamo le attività locali
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Collaboriamo con numerosi fornitori del territorio per aiutarli a farsi conoscere e vendere i propri prodotti.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Attraverso la visibilità offerta da Obaldi, queste realtà raggiungono nuovi clienti <strong>senza costi pubblicitari</strong>, mantenendo prezzi più bassi.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-200/50">
                <div className="h-14 w-14 rounded-2xl bg-[#0b224e]/10 flex items-center justify-center mb-6">
                  <FaSearch className="text-2xl text-[#0b224e]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#0b224e] mb-4">
                  Troviamo il valore nascosto
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  In un mercato online dominante, le attività locali propongono spesso offerte convenienti ma faticano a emergere.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Quando troviamo un&apos;opportunità valida, ti guidiamo verso la soluzione migliore: Obaldi o direttamente il venditore locale.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-lg text-[#0b224e] font-semibold">
                Obaldi trova il valore dove gli altri non guardano: nei prezzi giusti e nelle realtà locali che meritano visibilità.
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
                  <FaCheck className="text-3xl text-[#0b224e]" />
                </div>
                <p className="text-slate-700 font-medium">Un prodotto ti serve davvero</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-2xl bg-[#0b224e]/10 flex items-center justify-center mb-3">
                  <FaGem className="text-3xl text-[#0b224e]" />
                </div>
                <p className="text-slate-700 font-medium">Vuoi pagare il giusto</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-2xl bg-[#0b224e]/10 flex items-center justify-center mb-3">
                  <FaShieldAlt className="text-3xl text-[#0b224e]" />
                </div>
                <p className="text-slate-700 font-medium">Cerchi trasparenza</p>
              </div>
            </div>

            <p className="text-lg text-slate-600 mb-8">
              Obaldi non vuole essere l&apos;unico posto dove compri.<br />
              <span className="font-semibold text-[#0b224e]">Vuole essere il posto dove ti senti al sicuro.</span>
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/membership"
                className="group px-10 py-5 rounded-full bg-[#0b224e] text-white font-semibold text-lg shadow-lg shadow-[#0b224e]/20 hover:shadow-xl hover:shadow-[#0b224e]/30 hover:scale-105 transition-all duration-300"
              >
                Entra e diventa parte di Obaldi
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
