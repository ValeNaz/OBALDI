
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Product } from '../types';

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Kit Protezione Web V1', description: 'Analizzatore hardware per pacchetti di rete.', price: 49.00, imageUrl: 'https://picsum.photos/seed/tech1/400/300', status: 'APPROVED', sellerId: 's1', isPointsEligible: true, pointsPrice: 20 },
  { id: '2', name: 'Zaino Anti-Theft Pro', description: 'Sicurezza passiva per i tuoi dispositivi.', price: 89.00, imageUrl: 'https://picsum.photos/seed/tech2/400/300', status: 'APPROVED', sellerId: 's1', isPointsEligible: false },
  { id: '3', name: 'Webcam Privacy Guard', description: 'Otturatore fisico e LED di stato reale.', price: 25.00, imageUrl: 'https://picsum.photos/seed/tech3/400/300', status: 'APPROVED', sellerId: 's2', isPointsEligible: true, pointsPrice: 10 },
  { id: '4', name: 'Manuale Tutela 2024', description: 'Guida cartacea alle truffe bancarie.', price: 15.00, imageUrl: 'https://picsum.photos/seed/tech4/400/300', status: 'APPROVED', sellerId: 's2', isPointsEligible: false }
];

const Marketplace: React.FC = () => {
  const { user } = useUser();
  const [search, setSearch] = useState('');

  const filtered = MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-[#0b224e]">Marketplace</h1>
          <p className="text-slate-500 mt-1">Prodotti verificati e pronti all'uso.</p>
        </div>
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Cerca prodotto..." 
            className="w-full pl-4 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#0b224e] outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute right-4 top-3.5 text-slate-400">🔍</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filtered.map(product => (
          <div key={product.id} className="bg-white border rounded-xl overflow-hidden group hover:shadow-md transition">
            <Link to={`/product/${product.id}`} className="block">
              <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 group-hover:text-[#a41f2e] transition">{product.name}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mt-auto">
                  <div className="font-bold text-xl text-[#0b224e]">€{product.price.toFixed(2)}</div>
                  {product.isPointsEligible && (
                    <div className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      🪙 {product.pointsPrice} Punti
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 uppercase mt-2 font-bold tracking-wider">Spedizione inclusa per membri</div>
              </div>
            </Link>
            <div className="px-6 pb-6 mt-auto">
              {user?.isMember ? (
                <button className="w-full py-2 bg-[#0b224e] text-white text-sm font-bold rounded hover:opacity-90">
                  Aggiungi al carrello
                </button>
              ) : (
                <Link to="/membership" className="block text-center w-full py-2 bg-slate-100 text-[#0b224e] text-sm font-bold rounded hover:bg-slate-200">
                  Diventa membro per acquistare
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
