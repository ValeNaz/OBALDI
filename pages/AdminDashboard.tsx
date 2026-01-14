
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const AdminDashboard: React.FC = () => {
  const { user } = useUser();
  const [pending, setPending] = useState([
    { id: 'p1', name: 'Software Analisi X', seller: 'Marco Rossi', price: 120 },
    { id: 'p2', name: 'USB Vault 2048', seller: 'TechSecure Srl', price: 35 }
  ]);

  if (user?.role !== 'ADMIN') return <Navigate to="/" />;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-32 pb-12">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold text-[#0b224e]">Console Amministrazione</h1>
        <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-red-100">Accesso Protetto</div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <nav className="space-y-1">
            <button className="w-full text-left p-3 rounded bg-slate-100 font-bold text-slate-900">Prodotti in coda ({pending.length})</button>
            <button className="w-full text-left p-3 rounded hover:bg-slate-50 font-medium text-slate-500">Gestione News</button>
            <button className="w-full text-left p-3 rounded hover:bg-slate-50 font-medium text-slate-500">Audit Log</button>
            <button className="w-full text-left p-3 rounded hover:bg-slate-50 font-medium text-slate-500">Gestione Utenti</button>
          </nav>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4">Prodotto</th>
                  <th className="px-6 py-4">Seller</th>
                  <th className="px-6 py-4">Prezzo</th>
                  <th className="px-6 py-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {pending.map(p => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 font-bold">{p.name}</td>
                    <td className="px-6 py-4">{p.seller}</td>
                    <td className="px-6 py-4">€{p.price}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold" onClick={() => setPending(prev => prev.filter(x => x.id !== p.id))}>Approva</button>
                      <button className="bg-[#a41f2e] text-white px-3 py-1.5 rounded text-xs font-bold">Rigetta</button>
                    </td>
                  </tr>
                ))}
                {pending.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Nessun prodotto in attesa di approvazione.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
