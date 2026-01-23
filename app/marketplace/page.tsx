"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { useCart } from "@/context/CartContext";
import HeroCarousel from "@/components/home/HeroCarousel";
import PromoModuleGrid from "@/components/home/PromoModuleGrid";
import SplitModulesRow from "@/components/home/SplitModulesRow";
import ProductCarouselSection from "@/components/home/ProductCarouselSection";
import HistoryStrip from "@/components/home/HistoryStrip";
import {
  carouselSections,
  collectionModules,
  heroSlides,
  historyItems,
  promoModules,
  splitModules,
  stripSections
} from "@/lib/homeData";

type ApiProduct = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  premiumOnly: boolean;
  pointsEligible: boolean;
  pointsPrice: number | null;
  media: Array<{
    id: string;
    url: string;
    type: "IMAGE" | "VIDEO";
    sortOrder: number;
  }>;
};

const Marketplace = () => {
  const { user } = useUser();
  const { addItem } = useCart();
  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.trim() ?? "";
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        const url = query ? `/api/products?q=${encodeURIComponent(query)}` : "/api/products";
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        setProducts(data.products ?? []);
      } catch {
        // Ignore fetch errors for now; API may not be ready in dev.
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [query]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setOrderSuccess(params.get("order_success") === "1");
  }, []);

  return (
    <div className="container-max page-pad pt-36 md:pt-44 pb-16">
      {orderSuccess && (
        <div className="mb-8 text-sm text-green-700 font-semibold bg-green-50 border border-green-100 rounded-xl px-4 py-3">
          Pagamento completato! Ti aggiorneremo sullo stato dell&apos;ordine.
        </div>
      )}

      <HeroCarousel slides={heroSlides} />

      <section className="section-pad">
        <PromoModuleGrid modules={promoModules} />
      </section>

      <SplitModulesRow featured={splitModules.featured} side={splitModules.side} />

      <ProductCarouselSection section={carouselSections[0]} />

      <ProductCarouselSection section={carouselSections[1]} />

      <section className="section-pad">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#0b224e]">Collezioni in evidenza</h2>
        </div>
        <PromoModuleGrid modules={collectionModules} />
      </section>

      {stripSections.map((section) => (
        <ProductCarouselSection key={section.id} section={section} />
      ))}

      <ProductCarouselSection section={carouselSections[2]} />

      <HistoryStrip items={historyItems} />

      <section className="section-pad" id="catalogo">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#0b224e]">
              Catalogo marketplace
            </h2>
            <p className="text-slate-500 mt-2">
              {query ? `Risultati per "${query}".` : "Prodotti verificati e pronti all'uso."}
            </p>
          </div>
          <Link
            href="/membership"
            className="rounded-full bg-white/70 px-5 py-2 text-sm font-semibold text-[#0b224e] hover:bg-white"
          >
            Diventa membro per acquistare
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading &&
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="glass-panel h-72 animate-pulse"
              />
            ))}
          {!loading &&
            products.map((product) => {
              const coverMedia =
                product.media.find((media) => media.type === "IMAGE") ?? product.media[0];
              const coverUrl =
                coverMedia?.type === "IMAGE"
                  ? coverMedia.url
                  : "https://picsum.photos/seed/obaldi/400/300";
              const handleAdd = () => {
                addItem({
                  productId: product.id,
                  title: product.title,
                  priceCents: product.priceCents,
                  currency: product.currency,
                  image: coverUrl,
                  qty: 1,
                  pointsEligible: product.pointsEligible,
                  pointsPrice: product.pointsPrice,
                  premiumOnly: product.premiumOnly
                });
                if (!user?.isMember) {
                  window.location.href = "/membership";
                }
              };

              return (
              <div key={product.id} className="glass-card overflow-hidden group glass-hover">
                <Link href={`/product/${product.id}`} className="block">
                  {coverMedia?.type === "VIDEO" ? (
                    <video
                      src={coverUrl}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <Image
                      src={coverUrl}
                      alt={product.title}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-[#a41f2e] transition">
                      {product.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center mt-auto">
                      <div className="font-bold text-xl text-[#0b224e]">
                        €{(product.priceCents / 100).toFixed(2)}
                      </div>
                      <div className="flex items-center gap-2">
                        {product.premiumOnly && (
                          <span className="text-[10px] font-bold text-[#a41f2e] uppercase tracking-wider">
                            Solo Premium
                          </span>
                        )}
                        {product.pointsEligible && product.pointsPrice !== null && (
                          <div className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            🪙 fino a {product.pointsPrice} punti
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase mt-2 font-bold tracking-wider">
                      Spedizione inclusa per membri
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Punti: {product.pointsEligible && product.pointsPrice !== null ? `fino a ${product.pointsPrice}` : "non disponibili"}
                    </div>
                  </div>
                </Link>
                <div className="px-6 pb-6 mt-auto">
                  {product.premiumOnly && user?.isMember && !user.isPremium ? (
                    <button
                      className="w-full py-2 bg-slate-200 text-slate-500 text-sm font-bold rounded-full cursor-not-allowed"
                      disabled
                    >
                      Solo per Premium
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAdd}
                      className="w-full py-2 bg-[#0b224e] text-white text-sm font-bold rounded-full hover:opacity-90"
                    >
                      {user?.isMember ? "Aggiungi al carrello" : "Registrati per aggiungere"}
                    </button>
                  )}
                </div>
              </div>
              );
            })}
          {!loading && products.length === 0 && (
            <div className="col-span-full bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
              Nessun prodotto approvato trovato.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Marketplace;
