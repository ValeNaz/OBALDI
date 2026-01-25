"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { useCart } from "@/context/CartContext";
import HeroCarousel from "@/components/home/HeroCarousel";
import PromoModuleGrid from "@/components/home/PromoModuleGrid";
import SplitModulesRow from "@/components/home/SplitModulesRow";
import ProductCarouselSection from "@/components/home/ProductCarouselSection";
import HistoryStrip from "@/components/home/HistoryStrip";
import InfiniteMarquee from "@/components/home/InfiniteMarquee";
import CatalogSidebar from "@/components/home/CatalogSidebar";
import {
  carouselSections,
  collectionModules,
  heroSlides,
  historyItems,
  promoModules,
  splitModules,
  stripSections,
  categories as baseCategories,
  type Product,
  type HeroSlide,
  type PromoModule,
  type CarouselSection
} from "@/lib/homeData";

const Marketplace = () => {
  const { user } = useUser();
  const { addItem } = useCart();
  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.trim() ?? "";

  // UI State
  const [showFullCatalog, setShowFullCatalog] = useState(false);

  // Filter State
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("date-desc");

  // Data State
  const [heroData, setHeroData] = useState<HeroSlide[]>([]);
  const [promoData, setPromoData] = useState<PromoModule[]>([]);
  const [splitData, setSplitData] = useState<{ featured: any, side: any[] }>({ featured: splitModules.featured, side: splitModules.side });
  const [carouselSectionsData, setCarouselSectionsData] = useState<CarouselSection[]>([]);
  const [collectionModulesData, setCollectionModulesData] = useState<PromoModule[]>([]);
  const [historyItemsData, setHistoryItemsData] = useState<any[]>([]);
  const [catalogItems, setCatalogItems] = useState<Product[]>([]);

  const [catalogLoading, setCatalogLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(searchParams.get("cat") || "ALL");

  useEffect(() => {
    const cat = searchParams.get("cat");
    setActiveCategory(cat || "ALL");
    if (cat && cat !== "ALL") setShowFullCatalog(true);
  }, [searchParams]);

  const pathname = usePathname();
  const router = useRouter();

  const categories = [
    { id: "ALL", label: "Tutte" },
    ...baseCategories
  ];

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    const params = new URLSearchParams(window.location.search);
    params.delete("query");
    if (catId === "ALL") {
      params.delete("cat");
    } else {
      params.set("cat", catId);
      setShowFullCatalog(true);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const fetchInitialData = async (category: string = "ALL") => {
    try {
      setPageLoading(true);
      const res = await fetch(`/api/marketplace?userId=${user?.id || ""}&category=${category}`);
      if (!res.ok) throw new Error("Failed to load marketplace data");
      const data = await res.json();

      setHeroData(data.hero?.length > 0 ? data.hero : []);

      if (data.promo?.length > 0) {
        setPromoData([
          { id: "dynamic-promo-1", title: "Consigliati per te", ctaLabel: "Scopri", ctaHref: "#", kind: "resume" as const, items: data.promo.slice(0, 4) },
          { id: "dynamic-promo-2", title: "Offerte del giorno", ctaLabel: "Vedi tutte", ctaHref: "#", kind: "offers" as const, items: data.promo.slice(4, 8) }
        ]);
      } else {
        setPromoData([]);
      }

      if (data.split?.length > 0) {
        setSplitData({ featured: data.split[0], side: data.split.slice(1, 3) });
      } else {
        setSplitData({ featured: null, side: [] });
      }

      if (data.carousel?.length > 0 || data.recommended?.length > 0) {
        setCarouselSectionsData([
          { id: "carousel-1", title: "Scelti per te", variant: "compact" as const, items: data.recommended?.length > 0 ? data.recommended : data.carousel.slice(0, 8) },
          { id: "carousel-2", title: "Nuove scoperte", variant: "compact" as const, items: data.carousel.slice(8, 16) }
        ].filter(s => s.items.length > 0));
      } else {
        setCarouselSectionsData([]);
      }

      if (data.collection?.length > 0) {
        setCollectionModulesData([
          { id: "col-1", title: "Collezione Premium", ctaLabel: "Esplora", ctaHref: "#", kind: "resume" as const, items: data.collection.slice(0, 4) },
          { id: "col-2", title: "Speciali del Mese", ctaLabel: "Scopri", ctaHref: "#", kind: "offers" as const, items: data.collection.slice(4, 8) }
        ].filter(m => m.items.length > 0));
      } else {
        setCollectionModulesData([]);
      }

      setHistoryItemsData(data.history?.length > 0 ? data.history : []);
      setCatalogItems(data.catalog || []);

    } catch (err) {
      console.error(err);
    } finally {
      setPageLoading(false);
    }
  };

  const loadFullCatalog = async () => {
    setCatalogLoading(true);
    try {
      const minCents = minPrice ? parseFloat(minPrice) * 100 : "";
      const maxCents = maxPrice ? parseFloat(maxPrice) * 100 : "";
      const url = `/api/products?q=${encodeURIComponent(query)}&category=${activeCategory === "ALL" ? "" : activeCategory}&minPrice=${minCents}&maxPrice=${maxCents}&sort=${sort}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const mapped = (data.products ?? []).map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          image: p.media.find((m: any) => m.type === "IMAGE")?.url ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600&h=400",
          priceCents: p.priceCents,
          currency: p.currency,
          premiumOnly: p.premiumOnly,
          pointsEligible: p.pointsEligible,
          pointsPrice: p.pointsPrice,
          rating: 4.5,
          ratingCount: 10
        }));
        setCatalogItems(mapped);
      }
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    if (!query && activeCategory === "ALL" && !showFullCatalog) {
      fetchInitialData(activeCategory);
    } else {
      loadFullCatalog();
    }
  }, [user?.id, activeCategory, query, showFullCatalog, minPrice, maxPrice, sort]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setOrderSuccess(params.get("order_success") === "1");
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      title: product.title,
      priceCents: product.priceCents ?? 0,
      currency: product.currency ?? "EUR",
      image: product.image,
      qty: 1,
      pointsEligible: product.pointsEligible ?? false,
      pointsPrice: product.pointsPrice ?? null,
      premiumOnly: product.premiumOnly ?? false
    });
    if (!user?.isMember) {
      window.location.href = "/membership";
    }
  };

  const handleResetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSort("date-desc");
    setActiveCategory("ALL");
    router.push(pathname, { scroll: false });
  };

  const isHomeView = !query && activeCategory === "ALL" && !showFullCatalog;

  return (
    <div className="container-max page-pad pt-36 md:pt-44 pb-16 min-h-screen">
      {orderSuccess && (
        <div className="mb-8 text-sm text-green-700 font-semibold bg-green-50 border border-green-100 rounded-xl px-4 py-3">
          Pagamento completato! Ti aggiorneremo sullo stato dell&apos;ordine.
        </div>
      )}

      {isHomeView ? (
        <div className="animate-fade-in-soft flex flex-col gap-2">
          <HeroCarousel slides={heroData} className="py-4 md:py-6" />

          {promoData.length > 0 && (
            <section className="py-4 md:py-6">
              <PromoModuleGrid modules={promoData} />
            </section>
          )}

          {splitData.featured && (
            <SplitModulesRow featured={splitData.featured} side={splitData.side} className="py-4 md:py-6" />
          )}

          {carouselSectionsData.map((section) => (
            <ProductCarouselSection key={section.id} section={section} className="py-4 md:py-6" />
          ))}

          {collectionModulesData.length > 0 && (
            <section className="py-4 md:py-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-[#0b224e]">Collezioni in evidenza</h2>
              </div>
              <PromoModuleGrid modules={collectionModulesData} />
            </section>
          )}

          {/* Catalog Preview as Marquee */}
          <section className="py-8" id="catalogo">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-display font-bold text-[#0b224e]">Vetrina Marketplace</h2>
                <p className="text-slate-500 text-sm mt-2">I prodotti più desiderati della nostra community.</p>
              </div>
              <button
                onClick={() => setShowFullCatalog(true)}
                className="bg-[#0b224e] text-white px-8 py-3 rounded-full font-bold hover:shadow-glow-soft transition text-sm"
              >
                Visualizza tutto →
              </button>
            </div>
            <InfiniteMarquee items={catalogItems} isLoading={pageLoading} />
          </section>
        </div>
      ) : (
        /* Full Catalog Mode */
        <div className="flex flex-col lg:flex-row gap-12 mt-4 animate-fade-in-soft">
          <CatalogSidebar
            categories={categories.map(c => ({ ...c, href: c.id === 'ALL' ? '/marketplace' : `/marketplace?cat=${c.id}` }))}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={(min, max) => { setMinPrice(min); setMaxPrice(max); }}
            sort={sort}
            onSortChange={setSort}
            onResetFilters={handleResetFilters}
          />

          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-display font-bold text-[#0b224e]">
                  {activeCategory === "ALL" ? "Catalogo Completo" : categories.find(c => c.id === activeCategory)?.label}
                </h1>
                {catalogItems.length > 0 && (
                  <p className="text-slate-400 text-xs mt-1 uppercase font-bold tracking-widest">
                    {catalogItems.length} prodotti trovati
                  </p>
                )}
              </div>
              {activeCategory === "ALL" && !query && (
                <button
                  onClick={() => setShowFullCatalog(false)}
                  className="text-slate-400 hover:text-[#0b224e] font-bold text-xs uppercase tracking-widest transition"
                >
                  Torna alla Vetrina
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {catalogLoading ? (
                Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="glass-panel h-80 animate-pulse" />
                ))
              ) : (
                catalogItems.map((product) => (
                  <div key={product.id} className="glass-card overflow-hidden group glass-hover">
                    <Link href={`/product/${product.id}`} className="block">
                      <div className="relative w-full h-56">
                        <Image src={product.image} alt={product.title} fill className="object-cover" />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-[#a41f2e] transition">
                          {product.title}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="font-bold text-xl text-[#0b224e]">€{((product.priceCents || 0) / 100).toFixed(2)}</div>
                          <div className="flex flex-col items-end gap-1">
                            {product.premiumOnly && <span className="text-[10px] font-bold text-[#a41f2e] uppercase">Solo Premium</span>}
                            {product.pointsEligible && product.pointsPrice && (
                              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600">🪙 {product.pointsPrice} punti</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="px-6 pb-6">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-2.5 bg-[#0b224e] text-white text-xs font-bold rounded-full hover:shadow-lg transition"
                      >
                        {user?.isMember ? "Aggiungi al carrello" : "Registrati per acquistare"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!catalogLoading && catalogItems.length === 0 && (
              <div className="bg-white/50 border border-dashed border-slate-200 rounded-[2rem] p-20 text-center">
                <p className="text-slate-400 font-medium whitespace-pre-wrap">
                  Nessun prodotto corrisponde ai criteri selezionati.{"\n"}Prova a cambiare i filtri o la categoria.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {historyItemsData.length > 0 && (
        <section className="mt-20">
          <HistoryStrip items={historyItemsData} className="py-4 md:py-6" />
        </section>
      )}
    </div>
  );
};

export default Marketplace;
