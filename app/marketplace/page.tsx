"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaTimes } from "react-icons/fa";
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
          image: p.media.find((m: any) => m.type === "IMAGE")?.url ?? "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGMUY1RjkiLz48L3N2Zz4=",
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
    <div className="container-max page-pad pt-36 md:pt-40 pb-12 min-h-screen">
      {orderSuccess && (
        <div className="mb-8 text-sm text-green-700 font-semibold bg-green-50 border border-green-100 rounded-xl px-4 py-3">
          Pagamento completato! Ti aggiorneremo sullo stato dell&apos;ordine.
        </div>
      )}

      {isHomeView ? (
        <div className="animate-fade-in-soft flex flex-col gap-4 md:gap-5">
          {/* Hero Carousel */}
          <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <HeroCarousel slides={heroData} className="py-4 md:py-5" />
          </section>

          {/* Promo Modules */}
          {promoData.length > 0 && (
            <section className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
              <h2 className="text-lg font-display font-bold text-[#0b224e] mb-4">Consigliati per te</h2>
              <PromoModuleGrid modules={promoData} />
            </section>
          )}

          {/* Split Modules */}
          {splitData.featured && (
            <section className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100">
              <SplitModulesRow featured={splitData.featured} side={splitData.side} />
            </section>
          )}

          {/* Product Carousels */}
          {carouselSectionsData.length > 0 && (
            <section className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
              <div className="flex flex-col gap-5">
                {carouselSectionsData.map((section) => (
                  <ProductCarouselSection key={section.id} section={section} />
                ))}
              </div>
            </section>
          )}

          {/* Collection Modules */}
          {collectionModulesData.length > 0 && (
            <section className="bg-gradient-to-br from-[#0b224e] to-[#1a3a6e] rounded-2xl p-4 md:p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-bold text-white">Collezioni in evidenza</h2>
              </div>
              <PromoModuleGrid modules={collectionModulesData} />
            </section>
          )}

          {/* Catalog Preview as Marquee */}
          <section className="bg-white rounded-2xl p-4 md:p-5 shadow-sm" id="catalogo">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-5 gap-3">
              <div>
                <h2 className="text-xl font-display font-bold text-[#0b224e]">Vetrina Marketplace</h2>
                <p className="text-slate-500 text-xs mt-1">I prodotti più desiderati della nostra community.</p>
              </div>
              <button
                onClick={() => setShowFullCatalog(true)}
                className="bg-[#0b224e] text-white px-5 py-2 rounded-full font-bold hover:shadow-glow-soft transition text-xs whitespace-nowrap"
              >
                Visualizza tutto →
              </button>
            </div>
            <InfiniteMarquee items={catalogItems} isLoading={pageLoading} />
          </section>
        </div>
      ) : (
        /* Full Catalog Mode */
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 mt-2 animate-fade-in-soft">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex justify-between items-center">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-[#0b224e] shadow-sm active:scale-95 transition-transform"
            >
              <span>🔍</span> Filtri e Ordinamento
            </button>
          </div>

          {/* Sidebar */}
          <div className={`fixed inset-0 z-[60] lg:relative lg:z-0 lg:block ${showMobileFilters ? 'block' : 'hidden'}`}>
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white p-6 shadow-2xl lg:p-0 lg:bg-transparent lg:shadow-none lg:w-64 lg:static h-full overflow-y-auto lg:overflow-visible transition-transform">
              <div className="flex items-center justify-between mb-8 lg:hidden">
                <h2 className="text-xl font-display font-bold text-[#0b224e]">Filtri</h2>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 text-slate-400">
                  <FaTimes size={20} />
                </button>
              </div>
              {/* Desktop sidebar with white background */}
              <div className="lg:bg-white lg:rounded-2xl lg:p-5 lg:shadow-sm lg:border lg:border-slate-100">
                <CatalogSidebar
                  categories={categories.map(c => ({ ...c, href: c.id === 'ALL' ? '/marketplace' : `/marketplace?cat=${c.id}` }))}
                  activeCategory={activeCategory}
                  onCategoryChange={(id) => { handleCategoryChange(id); setShowMobileFilters(false); }}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onPriceChange={(min, max) => { setMinPrice(min); setMaxPrice(max); }}
                  sort={sort}
                  onSortChange={(s) => { setSort(s); setShowMobileFilters(false); }}
                  onResetFilters={() => { handleResetFilters(); setShowMobileFilters(false); }}
                />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Header */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h1 className="text-xl md:text-2xl font-display font-bold text-[#0b224e]">
                    {activeCategory === "ALL" ? "Catalogo Completo" : categories.find(c => c.id === activeCategory)?.label}
                  </h1>
                  {catalogItems.length > 0 && (
                    <p className="text-slate-400 text-[10px] mt-0.5 uppercase font-bold tracking-widest">
                      {catalogItems.length} prodotti
                    </p>
                  )}
                </div>
                {activeCategory === "ALL" && !query && (
                  <button
                    onClick={() => setShowFullCatalog(false)}
                    className="text-slate-400 hover:text-[#0b224e] font-bold text-[10px] uppercase tracking-widest transition"
                  >
                    ← Vetrina
                  </button>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {catalogLoading ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl h-64 animate-pulse" />
                  ))
                ) : (
                  catalogItems.map((product) => (
                    <div key={product.id} className="bg-slate-50 rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
                      <Link href={`/product/${product.id}`} className="block">
                        <div className="relative w-full h-32 sm:h-36 bg-slate-100">
                          <Image
                            src={product.image}
                            alt=""
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          />
                        </div>
                        <div className="p-2.5">
                          <h3 className="font-bold text-xs mb-0.5 group-hover:text-[#a41f2e] transition line-clamp-1">
                            {product.title}
                          </h3>
                          <p className="text-[10px] text-slate-500 mb-2 line-clamp-1">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="font-bold text-sm text-[#0b224e]">€{((product.priceCents || 0) / 100).toFixed(2)}</div>
                            {product.premiumOnly && <span className="text-[8px] font-bold text-[#a41f2e] uppercase">Premium</span>}
                          </div>
                        </div>
                      </Link>
                      <div className="px-2.5 pb-2.5">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full py-1.5 bg-[#0b224e] text-white text-[10px] font-bold rounded-full hover:shadow-md transition"
                        >
                          {user?.isMember ? "Aggiungi" : "Registrati"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {!catalogLoading && catalogItems.length === 0 && (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-16 text-center">
                  <p className="text-slate-400 font-medium whitespace-pre-wrap">
                    Nessun prodotto corrisponde ai criteri selezionati.{"\n"}Prova a cambiare i filtri o la categoria.
                  </p>
                </div>
              )}
            </div>
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
