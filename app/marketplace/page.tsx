"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "../../context/UserContext";

type ApiProduct = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  pointsEligible: boolean;
  pointsPrice: number | null;
};

const Marketplace = () => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ApiProduct[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch("/api/products", {
          signal: controller.signal
        });
        if (!response.ok) return;
        const data = await response.json();
        setProducts(data.products ?? []);
      } catch {
        // Ignore fetch errors for now; API may not be ready in dev.
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const filtered = products.filter((product) =>
    product.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-16">
      {searchParams?.get("order_success") === "1" && (
        <div className="mb-8 text-sm text-green-700 font-semibold bg-green-50 border border-green-100 rounded-xl px-4 py-3">
          Pagamento completato! Ti aggiorneremo sullo stato dell&apos;ordine.
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e]">Marketplace</h1>
          <p className="text-slate-500 mt-2">Prodotti verificati e pronti all&apos;uso.</p>
        </div>
        <div className="relative w-full md:w-96 glass-panel px-4 py-2">
          <input
            type="text"
            placeholder="Cerca prodotto..."
            className="w-full bg-transparent pr-10 py-2 text-sm text-slate-700 outline-none"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span className="absolute right-4 top-3 text-slate-400">🔍</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filtered.map((product) => (
          <div key={product.id} className="glass-card overflow-hidden group glass-hover">
            <Link href={`/product/${product.id}`} className="block">
              <Image
                src="https://picsum.photos/seed/obaldi/400/300"
                alt={product.title}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 group-hover:text-[#a41f2e] transition">{product.title}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mt-auto">
                  <div className="font-bold text-xl text-[#0b224e]">€{(product.priceCents / 100).toFixed(2)}</div>
                  {product.pointsEligible && (
                    <div className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      🪙 {product.pointsPrice} Punti
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 uppercase mt-2 font-bold tracking-wider">
                  Spedizione inclusa per membri
                </div>
              </div>
            </Link>
            <div className="px-6 pb-6 mt-auto">
              {user?.isMember ? (
                <button className="w-full py-2 bg-[#0b224e] text-white text-sm font-bold rounded-full hover:opacity-90">
                  Aggiungi al carrello
                </button>
              ) : (
                <Link
                  href="/membership"
                  className="block text-center w-full py-2 bg-white/70 text-[#0b224e] text-sm font-bold rounded-full hover:bg-white"
                >
                  Diventa membro per acquistare
                </Link>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
            Nessun prodotto approvato trovato.
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
