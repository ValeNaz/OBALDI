"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "../../../context/UserContext";

const ProductDetail = () => {
  const params = useParams<{ id: string }>();
  const { user, points } = useUser();

  const product = {
    id: params?.id,
    name: "Kit Protezione Web V1",
    description:
      "Il Kit Protezione Web V1 è stato progettato per chi lavora in ambienti digitali ad alto rischio. Include un firewall hardware pre-configurato e un manuale operativo per la mitigazione dei rischi di phishing e injection. Ogni componente è stato testato dal nostro team tecnico.",
    fullSpecs: [
      "Hardware Open Source basato su ARM",
      "Consumo energetico ridotto < 5W",
      "Sistema operativo ObaldiOS preinstallato",
      "Supporto tecnico prioritario 24/7"
    ],
    price: 49.0,
    pointsPrice: 20,
    imageUrl: "https://picsum.photos/seed/tech1/800/600",
    isPointsEligible: true
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-32 pb-12">
      <Link href="/marketplace" className="text-sm font-bold text-slate-400 hover:text-[#0b224e] mb-8 inline-block">
        ← Torna al Marketplace
      </Link>

      <div className="grid md:grid-cols-2 gap-16">
        <div>
          <img src={product.imageUrl} alt={product.name} className="w-full rounded-2xl shadow-sm border" />
          <div className="grid grid-cols-4 gap-4 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-slate-100 rounded-lg border overflow-hidden">
                <img src={`https://picsum.photos/seed/${i}/200`} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="text-4xl font-bold text-[#0b224e] mb-4">{product.name}</h1>
          <div className="flex items-center space-x-4 mb-8">
            <div className="text-3xl font-black text-[#0b224e]">€{product.price.toFixed(2)}</div>
            <div className="text-sm text-slate-400 font-medium">Spedizione inclusa per i membri</div>
          </div>

          <p className="text-slate-600 mb-8 leading-relaxed">{product.description}</p>

          <div className="bg-slate-50 p-6 rounded-xl border mb-8">
            <h4 className="font-bold text-[#0b224e] mb-4 uppercase text-xs tracking-widest">Specifiche Tecniche</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              {product.fullSpecs.map((spec) => (
                <li key={spec} className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#a41f2e] rounded-full mr-3" /> {spec}
                </li>
              ))}
            </ul>
          </div>

          {user?.isMember ? (
            <div className="space-y-4">
              <button className="w-full py-4 bg-[#0b224e] text-white font-bold rounded-lg hover:opacity-95 transition flex items-center justify-center">
                Aggiungi al carrello
              </button>
              {user.isPremium && product.isPointsEligible && (
                <button
                  disabled={points < product.pointsPrice}
                  className={`w-full py-4 border-2 rounded-lg font-bold transition flex items-center justify-center ${
                    points >= product.pointsPrice
                      ? "border-slate-800 text-[#0b224e] bg-slate-50 hover:bg-slate-100"
                      : "border-slate-200 text-slate-300 cursor-not-allowed"
                  }`}
                >
                  Paga con {product.pointsPrice} Punti Obaldi
                </button>
              )}
            </div>
          ) : (
            <div className="bg-slate-100 p-6 rounded-xl text-center">
              <p className="text-sm font-medium text-slate-600 mb-4">
                L'acquisto di questo prodotto è riservato ai membri Obaldi.
              </p>
              <Link href="/membership" className="inline-block py-3 px-8 bg-[#a41f2e] text-white font-bold rounded-lg">
                Diventa membro ora
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
