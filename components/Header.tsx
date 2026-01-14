"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

const Header = () => {
  const { user, points, logout } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

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
};

export default Header;
