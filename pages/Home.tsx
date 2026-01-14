
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-white overflow-hidden">
      {/* HERO SECTION - Ultra Modern & Minimal con Focus Marketplace */}
      <section className="relative min-h-screen flex items-center px-4 overflow-hidden bg-[#0b224e]">
        {/* Background Image senza overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/media/Hero_Home.png"
            alt="Obaldi Hero"
            className="w-full h-full object-cover"
          />
        </div>

        <div className={`relative z-20 max-w-7xl mx-auto w-full pt-32 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-3xl">
            <p className="text-3xl md:text-5xl text-[#0b224e]/80 mb-6 animate-fade-in inline-block -rotate-2 origin-left" style={{ fontFamily: "'Caveat', cursive" }}>
              Consapevolezza Digitale
            </p>

            <h1 className="text-6xl md:text-8xl font-extrabold text-[#0b224e] leading-[1.05] tracking-tight mb-8">
              Obaldi.<br />
              <span className="text-[#0b224e]/40">L'acquisto è una scelta.</span>
            </h1>

            <p className="text-xl md:text-2xl text-[#0b224e]/70 mb-16 font-light leading-relaxed">
              Eliminiamo il rumore del marketing aggressivo. <br className="hidden md:block" />
              Ti aiutiamo a comprare solo ciò che serve davvero.
            </p>

            <div className="flex flex-col items-start gap-8">
              {/* Primary CTA - Marketplace (Massima Importanza) */}
              <Link
                to="/marketplace"
                className="group relative px-16 py-7 bg-[#0b224e] text-white rounded-full font-black text-2xl overflow-hidden transition-all hover:scale-105 shadow-[0_0_50px_rgba(11,34,78,0.2)] hover:shadow-[0_0_70px_rgba(11,34,78,0.4)] active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Esplora Marketplace
                  <svg className="w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-[#a41f2e] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>

              {/* Secondary CTA - Membership */}
              <Link
                to="/membership"
                className="px-10 py-4 text-[#0b224e]/60 hover:text-[#0b224e] rounded-full font-bold text-lg transition-all hover:bg-white/30"
              >
                oppure Diventa Membro →
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator Animato */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-40">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full animate-scroll-inner" />
          </div>
        </div>
      </section>

      {/* SEZIONE MANIFESTO */}
      <section className="py-40 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-24 items-center">
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-5xl font-bold text-[#0b224e] leading-tight">
              Oltre le promesse <br />gonfiate.
            </h2>
            <div className="h-1.5 w-20 bg-[#a41f2e]" />
            <p className="text-xl text-slate-500 leading-relaxed">
              Ti è mai capitato di ricevere un prodotto lontano anni luce da come ti era stato raccontato? Obaldi nasce per spezzare questo ciclo.
            </p>
            <p className="text-xl text-slate-500 leading-relaxed">
              Ti mostriamo la realtà. Senza filtri. Senza urgenza artificiale.
            </p>
          </div>
          <div className="relative group transition-all duration-700 hover:scale-[1.02]">
            <div className="absolute -inset-4 bg-slate-50 rounded-[3rem] -z-10 transition-transform group-hover:rotate-1" />
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <p className="text-3xl font-medium text-[#0b224e] leading-snug">
                "La nostra missione non è vendere, ma educare alla scelta."
              </p>
              <p className="mt-8 text-[#a41f2e] font-bold uppercase tracking-widest text-sm">Team Obaldi</p>
            </div>
          </div>
        </div>
      </section>

      {/* VALORI - Minimal Cards */}
      <section className="bg-slate-50 py-40 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-bold text-[#0b224e] mb-6 tracking-tight">Trasparenza Radicale.</h2>
            <p className="text-xl text-slate-500">Nessun costo di marketing. Paghi il valore reale.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { t: "Zero Pressione", d: "Nessun timer, nessuna mail di recupero carrello. Decidi con calma." },
              { t: "Analisi Vera", d: "Ogni scheda prodotto è scritta da tecnici, non da copywriter." },
              { t: "Supporto Umano", d: "Esperti reali pronti ad analizzare i tuoi dubbi sugli acquisti esterni." }
            ].map((item, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl border border-slate-200 hover:border-[#0b224e] hover:shadow-2xl hover:shadow-[#0b224e]/5 transition-all duration-500 group">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl mb-8 flex items-center justify-center group-hover:bg-[#0b224e] transition-colors duration-500">
                  <span className="text-[#0b224e] text-xl font-bold group-hover:text-white">{i + 1}</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0b224e] mb-4">{item.t}</h3>
                <p className="text-slate-500 leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSIONE - Dark Mode Section */}
      <section className="py-40 bg-[#0b224e] text-white px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-[#a41f2e] font-bold uppercase tracking-widest text-sm mb-8 block">Il tuo alleato digitale</span>
          <h2 className="text-5xl md:text-6xl font-bold mb-12 tracking-tight">Proteggiamo la tua spesa, ovunque tu compri.</h2>
          <p className="text-xl text-white/60 mb-16 leading-relaxed">
            Se un'offerta ti sembra troppo bella per essere vera, probabilmente non lo è. Il nostro team analizza siti e venditori per te, anche se decidi di non comprare da noi.
          </p>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="p-10 border border-white/10 rounded-3xl hover:bg-white/5 transition-all duration-500 group">
              <h4 className="text-2xl font-bold mb-4 group-hover:text-[#a41f2e] transition-colors">Analisi Siti</h4>
              <p className="text-white/50 leading-relaxed text-lg">Scoviamo segnali di rischio e clausole nascoste prima che tu inserisca la tua carta.</p>
            </div>
            <div className="p-10 border border-white/10 rounded-3xl hover:bg-white/5 transition-all duration-500 group">
              <h4 className="text-2xl font-bold mb-4 group-hover:text-[#a41f2e] transition-colors">Verifica Prezzi</h4>
              <p className="text-white/50 leading-relaxed text-lg">Ti diciamo se il prezzo è gonfiato per simulare uno sconto inesistente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-48 px-4 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl font-bold text-[#0b224e] mb-12 tracking-tight">Compri solo se ha senso.</h2>
          <Link
            to="/marketplace"
            className="inline-block bg-[#0b224e] text-white px-20 py-8 rounded-full font-black text-3xl hover:shadow-[0_20px_60px_rgba(11,34,78,0.3)] transition-all hover:-translate-y-2 active:scale-95"
          >
            Entra nel Marketplace
          </Link>
          <p className="mt-16 text-slate-400 font-medium italic text-lg">
            "Siamo qui per ridarti il controllo."
          </p>
        </div>
      </section>

      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.15); }
        }
        @keyframes scroll-inner {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Home;
