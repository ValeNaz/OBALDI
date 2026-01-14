
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 pt-32 pb-24">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-extrabold text-[#0b224e] mb-12">La nostra idea è semplice: ridare il controllo a chi acquista.</h1>

        <div className="prose prose-slate max-w-none space-y-12 text-xl leading-relaxed text-slate-600">
          <section>
            <h2 className="text-2xl font-bold text-[#0b224e] uppercase tracking-widest mb-6">Perché esistiamo</h2>
            <p>
              Obaldi non è nata per vendere, ma per proteggere. Siamo un collettivo di esperti che hanno deciso di dire basta alle dinamiche predatorie del commercio moderno.
              Il web oggi è saturo di "urgenza artificiale", "scarsità fittizia" e pubblicità che forza decisioni impulsive.
            </p>
          </section>

          <div className="bg-slate-50 p-12 rounded-[40px] border border-slate-100">
            <h3 className="text-2xl font-bold text-[#0b224e] mb-6 italic">La nostra visione è chiara:</h3>
            <p className="text-slate-600 mb-0">
              Aiutare e guidare le persone negli acquisti online, anche – e soprattutto – quando non stanno comprando da noi.
              Vogliamo diventare il punto di riferimento per chiunque abbia un dubbio, una paura o una domanda prima di cliccare su "Acquista".
            </p>
          </div>

          <section className="grid md:grid-cols-2 gap-12 pt-12">
            <div>
              <h3 className="text-lg font-bold text-[#0b224e] mb-4">Educazione continua</h3>
              <p className="text-base text-slate-500">
                La missione di Obaldi non è vendere prodotti. È educare le persone a riconoscere le promesse ingannevoli e a capire quando un prezzo è gonfiato.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0b224e] mb-4">Trasparenza Radicale</h3>
              <p className="text-base text-slate-500">
                Se un prodotto non ci convince, non lo vedrai mai qui. Se un venditore non rispetta i nostri standard etici, viene rimosso immediatamente.
              </p>
            </div>
          </section>

          <section className="pt-12 text-center">
            <p className="font-bold text-[#0b224e] text-3xl">Compri solo se ha senso.</p>
            <p className="text-slate-400 mt-4">Obaldi Team</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
