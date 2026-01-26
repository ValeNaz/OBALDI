"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Footer = () => {
  return (
    <footer className="mt-24 border-t border-white/20 bg-slate-900/90 text-slate-300 backdrop-blur-xl">
      <div className="border-b border-white/10">
        <div className="container-max page-pad py-4 flex items-center justify-between text-xs">
          <span className="uppercase tracking-widest text-slate-400">Obaldi Network</span>
          <Link href="#top" className="text-slate-200 hover:text-white">
            Torna su ↑
          </Link>
        </div>
      </div>

      <div className="container-max page-pad py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="inline-flex items-center mb-4" aria-label="Obaldi">
            <Image
              src="/media/logo_ObaldiWhite.png"
              alt="Obaldi"
              width={144}
              height={36}
              className="h-9 w-auto"
            />
          </Link>
          <p className="text-sm text-slate-400">Consapevolezza. Tutela. Acquisti sensati.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Marketplace</h4>
          <ul className="text-sm space-y-2">
            <li>
              <Link href="/marketplace" className="hover:text-white">
                Tutti i prodotti
              </Link>
            </li>
            <li>
              <Link href="/membership" className="hover:text-white">
                Membership
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-white">
                I tuoi ordini
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-white">
                Profilo
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Risorse</h4>
          <ul className="text-sm space-y-2">
            <li>
              <Link href="/news" className="hover:text-white">
                Prevenzione truffe
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-white">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/contatti" className="hover:text-white">
                Contatti
              </Link>
            </li>
            <li>
              <Link href="/resi-rimborsi" className="hover:text-white">
                Resi e rimborsi
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Legale</h4>
          <ul className="text-sm space-y-2">
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/termini" className="hover:text-white">
                Termini e condizioni
              </Link>
            </li>
            <li className="text-slate-400">Supporto: support@obaldi.it</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-max page-pad py-6 flex flex-col md:flex-row gap-4 items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>Italiano</span>
            <span>Italia</span>
          </div>
          <span>© 2024 Obaldi Network. Tutti i diritti riservati.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
