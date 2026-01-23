"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import CategoryNavRow from "@/components/home/CategoryNavRow";
import { categories } from "@/lib/homeData";
import CartDropdown from "@/components/CartDropdown";

const Header = () => {
  const { user, points, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isMarketplace = pathname?.startsWith("/marketplace");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      router.push("/marketplace");
      return;
    }
    router.push(`/marketplace?query=${encodeURIComponent(query)}&cat=${selectedCategory}`);
  };

  if (!isMarketplace) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 page-pad pt-4">
        <div className="container-max glass-card glass-hover">
          <div className="px-6 h-20 flex items-center justify-between">
            <nav className="flex items-center space-x-8">
              <Link
                href="/"
                className="flex items-center hover:opacity-80 transition-opacity"
                aria-label="Obaldi"
              >
                <Image
                  src="/media/logo_Obaldi.png"
                  alt="Obaldi"
                  width={160}
                  height={40}
                  className="h-10 w-auto"
                />
              </Link>
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/membership"
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#0b224e] rounded-full hover:bg-white/60 transition-all"
                >
                  Entra in Obaldi
                </Link>
                <Link
                  href="/about"
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#0b224e] rounded-full hover:bg-white/60 transition-all"
                >
                  Chi siamo
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

            <div className="flex items-center space-x-3">
              <CartDropdown />
              {user ? (
                <div className="flex items-center space-x-3">
                  {user.isPremium && (
                    <div className="flex items-center bg-white/70 px-4 py-2 rounded-full border border-amber-200/60 text-xs font-bold text-amber-900 shadow-sm">
                      <span className="mr-2">🪙</span> {points} Punti
                    </div>
                  )}
                  <span className="text-sm text-slate-600 hidden lg:block">{user.email}</span>
                  <Link
                    href={user.role === "ADMIN" ? "/admin" : user.role === "SELLER" ? "/seller" : "/profile"}
                    className="px-4 py-2 text-xs uppercase font-bold text-white bg-[#a41f2e] rounded-full hover:bg-[#8a1a26] transition-colors shadow-sm"
                  >
                    Area Riservata
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 text-xs uppercase font-bold text-slate-600 bg-white/70 rounded-full hover:bg-white transition-colors shadow-sm"
                  >
                    Esci
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-2.5 text-sm font-semibold rounded-full bg-[#0b224e] text-white hover:bg-[#1a3a6e] transition-all hover:shadow-glow-soft"
                >
                  Accedi
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="page-pad pt-4">
        <div className="container-max glass-card glass-hover">
          <div className="px-6 py-4 flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[auto,1fr,auto] lg:items-center">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="flex items-center hover:opacity-80 transition-opacity"
                  aria-label="Obaldi"
                >
                  <Image
                    src="/media/logo_Obaldi.png"
                    alt="Obaldi"
                    width={160}
                    height={40}
                    className="h-10 w-auto"
                  />
                </Link>
                <div className="hidden xl:flex flex-col text-xs text-slate-500">
                  <span>Consegna a</span>
                  <span className="font-semibold text-slate-700">Italia</span>
                </div>
              </div>

              <form
                onSubmit={handleSearchSubmit}
                className="flex w-full items-stretch gap-2 bg-white/70 rounded-2xl border border-white/70 p-2 shadow-sm"
                role="search"
              >
                <label className="sr-only" htmlFor="marketplace-category">
                  Categoria
                </label>
                <select
                  id="marketplace-category"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="rounded-xl bg-white/80 px-3 text-xs font-semibold text-slate-600 outline-none"
                  aria-label="Seleziona categoria"
                >
                  <option value="all">Tutte le categorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <label className="sr-only" htmlFor="marketplace-search">
                  Cerca prodotti
                </label>
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
                  className="rounded-xl bg-[#0b224e] px-4 text-sm font-semibold text-white hover:bg-[#1a3a6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b224e]/30"
                  aria-label="Avvia ricerca"
                >
                  Cerca
                </button>
              </form>

              <div className="flex items-center justify-between gap-3 lg:justify-end">
                <div className="flex items-center gap-2">
                  <Link
                    href="/orders"
                    className="hidden md:inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-[#0b224e]"
                  >
                    Ordini
                  </Link>
                  <Link
                    href="/profile"
                    className="hidden md:inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-[#0b224e]"
                  >
                    Preferiti
                  </Link>
                  <CartDropdown />
                </div>

                {user ? (
                  <div className="flex items-center space-x-3">
                    {user.isPremium && (
                      <div className="hidden lg:flex items-center bg-white/70 px-4 py-2 rounded-full border border-amber-200/60 text-xs font-bold text-amber-900 shadow-sm">
                        <span className="mr-2">🪙</span> {points} Punti
                      </div>
                    )}
                    <span className="text-sm text-slate-600 hidden lg:block">
                      {user.email}
                    </span>
                    <Link
                      href={
                        user.role === "ADMIN"
                          ? "/admin"
                          : user.role === "SELLER"
                            ? "/seller"
                            : "/profile"
                      }
                      className="px-4 py-2 text-xs uppercase font-bold text-white bg-[#a41f2e] rounded-full hover:bg-[#8a1a26] transition-colors shadow-sm"
                    >
                      Area Riservata
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-4 py-2 text-xs uppercase font-bold text-slate-600 bg-white/70 rounded-full hover:bg-white transition-colors shadow-sm"
                    >
                      Esci
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="px-6 py-2.5 text-sm font-semibold rounded-full bg-[#0b224e] text-white hover:bg-[#1a3a6e] transition-all hover:shadow-glow-soft"
                  >
                    Accedi
                  </Link>
                )}
              </div>
            </div>
          </div>
          <CategoryNavRow categories={categories} />
        </div>
      </div>
    </header>
  );
};

export default Header;
