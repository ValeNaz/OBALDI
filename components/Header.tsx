"use client";

import Link from "next/link";
import { useUser } from "../context/UserContext";

const Header = () => {
  const { user, points } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-900/5 border border-slate-200/50">
        <div className="px-6 h-20 flex items-center justify-between">
          <nav className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-2xl font-bold text-[#0b224e] hover:opacity-80 transition-opacity"
            >
              Obaldi
            </Link>
            <div className="hidden md:flex items-center space-x-2">
              <Link
                href="/membership"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#0b224e] rounded-full hover:bg-slate-50 transition-all"
              >
                Entra in Obaldi
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#0b224e] rounded-full hover:bg-slate-50 transition-all"
              >
                Chi siamo
              </Link>
              <Link
                href="/marketplace"
                className="relative group px-6 py-2.5 bg-gradient-to-r from-[#0b224e] to-[#1a3a6e] text-white text-sm font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#0b224e]/30 ml-2"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Marketplace
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#a41f2e] to-[#c92a3a] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {user.isPremium && (
                  <div className="flex items-center bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2 rounded-full border border-amber-200/50 text-xs font-bold text-amber-900 shadow-sm">
                    <span className="mr-2">🪙</span> {points} Punti
                  </div>
                )}
                <span className="text-sm text-slate-600 hidden lg:block">{user.email}</span>
                <Link
                  href={user.role === "ADMIN" ? "/admin" : user.role === "SELLER" ? "/seller" : "/profile"}
                  className="px-4 py-2 text-xs uppercase font-bold text-white bg-[#a41f2e] rounded-full hover:bg-[#8a1a26] transition-colors"
                >
                  Area Riservata
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2.5 text-sm font-semibold rounded-full bg-[#0b224e] text-white hover:bg-[#1a3a6e] transition-all hover:shadow-lg hover:shadow-[#0b224e]/30"
              >
                Accedi
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
