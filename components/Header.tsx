"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../context/UserContext";
import { categories } from "@/lib/homeData";
import CartDropdown from "@/components/CartDropdown";
import UserMenu from "@/components/UserMenu";
import NotificationBell from "@/components/NotificationBell";
import { FaCoins, FaBars, FaTimes, FaSearch } from "react-icons/fa";

const Header = () => {
  const { user, points, logout } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isMarketplace = pathname?.startsWith("/marketplace");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll visibility logic
  const [showCategories, setShowCategories] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 100) {
        setShowCategories(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setShowCategories(false);
      } else {
        // Scrolling up
        setShowCategories(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMarketplace) {
      const cat = new URLSearchParams(window.location.search).get("cat");
      setSelectedCategory(cat || "ALL");
    }
  }, [isMarketplace, searchParams]);

  const handleCategoryChangeInSearch = (catId: string) => {
    setSelectedCategory(catId);
    if (isMarketplace) {
      const params = new URLSearchParams(window.location.search);
      if (catId === "ALL") params.delete("cat");
      else params.set("cat", catId);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (selectedCategory !== "ALL") params.set("cat", selectedCategory);
    router.push(`/marketplace?${params.toString()}`);
  };

  if (!isMarketplace) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 page-pad pt-3 md:pt-4">
        <div className="container-max glass-card glass-hover overflow-visible">
          <div className="px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
            <nav className="flex items-center gap-4 md:space-x-8">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 md:hidden flex items-center justify-center -ml-2"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>

              <Link
                href="/"
                className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0"
                aria-label="Obaldi"
              >
                <Image
                  src="/media/logo_Obaldi.png"
                  alt="Obaldi"
                  width={140}
                  height={35}
                  className="h-8 md:h-10 w-auto object-contain"
                />
              </Link>

              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/about"
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#0b224e] rounded-full hover:bg-white/60 transition-all"
                >
                  Chi siamo
                </Link>
                <Link
                  href="/membership"
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#0b224e] rounded-full hover:bg-white/60 transition-all"
                >
                  Unisciti a noi
                </Link>
                <Link
                  href="/marketplace"
                  className="relative group px-6 py-2.5 bg-[#0b224e] text-white text-sm font-bold rounded-full overflow-hidden transition-all hover:scale-[1.03] hover:shadow-glow-soft ml-2"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Marketplace
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#a41f2e] to-[#c92a3a] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </div>
            </nav>

            <div className="flex items-center space-x-2 md:space-x-3">
              <CartDropdown />
              {user ? (
                <div className="flex items-center space-x-1 md:space-x-2">
                  {user.isPremium && (
                    <div className="hidden sm:flex items-center bg-white/70 px-4 py-2 rounded-full border border-amber-200/60 text-[10px] md:text-xs font-bold text-amber-900 shadow-sm">
                      <FaCoins className="mr-1 md:mr-2 text-amber-600" /> {points}
                    </div>
                  )}
                  <NotificationBell />
                  <UserMenu />
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-semibold rounded-full bg-[#0b224e] text-white hover:bg-[#1a3a6e] transition-all"
                >
                  Accedi
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 mt-2 p-4 animate-fade-up">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col p-4 gap-2 border border-slate-100">
                <Link
                  href="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-semibold"
                >
                  Chi siamo
                </Link>
                <Link
                  href="/membership"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-semibold"
                >
                  Unisciti a noi
                </Link>
                <Link
                  href="/marketplace"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-xl bg-[#0b224e] text-white font-bold"
                >
                  Marketplace →
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="page-pad pt-3 md:pt-4">
        <div className="container-max glass-card glass-hover overflow-visible transition-all duration-300">
          <div className="px-4 md:px-6 py-3 md:py-4 flex flex-col gap-3 md:gap-4">
            <div className="flex items-center justify-between lg:grid lg:grid-cols-[auto,1fr,auto] lg:gap-8 lg:items-center">
              <Link
                href="/"
                className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0"
                aria-label="Obaldi"
              >
                <Image
                  src="/media/logo_Obaldi.png"
                  alt="Obaldi"
                  width={140}
                  height={35}
                  className="h-8 md:h-9 w-auto object-contain"
                />
              </Link>

              <div className="hidden lg:block w-full">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex w-full items-stretch gap-2 bg-white/70 rounded-2xl border border-white/70 p-2 shadow-sm"
                  role="search"
                >
                  <select
                    id="marketplace-category"
                    value={selectedCategory}
                    onChange={(event) => handleCategoryChangeInSearch(event.target.value)}
                    className="rounded-xl bg-white/80 px-3 text-xs font-semibold text-slate-600 outline-none"
                    aria-label="Seleziona categoria"
                  >
                    <option value="ALL">Tutte le categorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <input
                    id="marketplace-search"
                    type="search"
                    placeholder="Cerca prodotti..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="flex-1 bg-transparent px-2 text-sm text-slate-700 outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#0b224e] px-4 text-sm font-semibold text-white hover:bg-[#1a3a6e]"
                  >
                    Cerca
                  </button>
                </form>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/orders"
                    className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-[#0b224e] transition-colors"
                  >
                    Ordini
                  </Link>
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-[#0b224e] transition-colors"
                  >
                    Preferiti
                  </Link>
                </div>

                <CartDropdown />

                {user ? (
                  <div className="flex items-center space-x-1 md:space-x-2">
                    {user.isPremium && (
                      <div className="hidden sm:flex lg:hidden items-center bg-white/70 px-3 py-1.5 rounded-full border border-amber-200/60 text-[10px] font-bold text-amber-900 shadow-sm">
                        <span>🪙</span> {points}
                      </div>
                    )}
                    <NotificationBell />
                    <UserMenu />
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-semibold rounded-full bg-[#0b224e] text-white hover:bg-[#1a3a6e] transition-all"
                  >
                    Accedi
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Search Bar - Only on MarketPlace */}
            <div className="lg:hidden">
              <form
                onSubmit={handleSearchSubmit}
                className="flex w-full items-stretch gap-1.5 bg-white/70 rounded-2xl border border-white/50 p-1.5 shadow-sm"
                role="search"
              >
                <input
                  type="search"
                  placeholder="Cerca prodotti..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="flex-1 bg-transparent px-3 text-xs md:text-sm text-slate-700 outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#0b224e] p-2 aspect-square flex items-center justify-center text-white"
                  aria-label="Cerca"
                >
                  <FaSearch size={14} />
                </button>
              </form>
            </div>
          </div>

          {/* Categories Row with Show/Hide Logic */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out border-t border-slate-100 ${showCategories ? "max-h-20 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
              }`}
          >
            <div className="px-4 md:px-6 py-2 flex items-center gap-6 overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleCategoryChangeInSearch("ALL")}
                className={`text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${selectedCategory === "ALL" ? "text-[#0b224e]" : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                Tutto
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChangeInSearch(cat.id)}
                  className={`text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${selectedCategory === cat.id ? "text-[#0b224e]" : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
