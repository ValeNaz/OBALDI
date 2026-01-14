
import React from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Membership: React.FC = () => {
  const { buyMembership } = useUser();
  const navigate = useNavigate();

  const handleSelect = (premium: boolean) => {
    buyMembership(premium);
    navigate('/marketplace');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-32 pb-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-[#0b224e] mb-4">Diventa un Membro Obaldi</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          L'accesso al nostro marketplace è riservato. Scegliendo uno dei nostri piani
          finanzi la nostra attività di ricerca e tutela anti-truffa.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Basic Plan */}
        <div className="border rounded-2xl p-8 bg-white flex flex-col hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-bold mb-2">Obaldi Accesso</h2>
          <div className="text-4xl font-black mb-6">€4,90 <span className="text-sm font-normal text-slate-400">/ 28 giorni</span></div>
          <ul className="space-y-4 mb-10 flex-grow text-slate-600">
            <li className="flex items-center"><span className="text-slate-400 mr-2">✓</span> Accesso completo al Marketplace</li>
            <li className="flex items-center"><span className="text-slate-400 mr-2">✓</span> Spedizioni gratuite incluse</li>
            <li className="flex items-center"><span className="text-slate-400 mr-2">✓</span> News Alert Truffe prioritari</li>
          </ul>
          <button
            onClick={() => handleSelect(false)}
            className="w-full py-4 border-2 border-[#0b224e] text-[#0b224e] font-bold rounded-lg hover:bg-slate-50 transition"
          >
            Scegli Accesso
          </button>
        </div>

        {/* Premium Plan */}
        <div className="border-2 border-[#0b224e] rounded-2xl p-8 bg-white flex flex-col shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#0b224e] text-white px-4 py-1 text-xs font-bold uppercase tracking-widest">Premium</div>
          <h2 className="text-2xl font-bold mb-2">Tutela Completa</h2>
          <div className="text-4xl font-black mb-6">€9,90 <span className="text-sm font-normal text-slate-400">/ 28 giorni</span></div>
          <ul className="space-y-4 mb-10 flex-grow text-slate-600">
            <li className="flex items-center"><span className="text-[#a41f2e] mr-2">🪙</span> 10 Punti Obaldi ogni 28 giorni</li>
            <li className="flex items-center"><span className="text-slate-400 mr-2">✓</span> Richiesta analisi acquisti esterni</li>
            <li className="flex items-center"><span className="text-slate-400 mr-2">✓</span> Prodotti esclusivi con Punti</li>
            <li className="flex items-center"><span className="text-slate-400 mr-2">✓</span> Tutte le funzioni di Accesso</li>
          </ul>
          <button
            onClick={() => handleSelect(true)}
            className="w-full py-4 bg-[#0b224e] text-white font-bold rounded-lg hover:opacity-95 transition"
          >
            Attiva Tutela Completa
          </button>
        </div>
      </div>

      <p className="mt-12 text-center text-xs text-slate-400">
        Rinnovo automatico ogni 28 giorni. Disdici quando vuoi dalla tua area riservata.
      </p>
    </div>
  );
};

export default Membership;
