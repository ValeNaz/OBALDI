import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="mt-24 border-t border-white/20 bg-slate-900/90 text-slate-300 backdrop-blur-xl">
      <div className="container-max page-pad py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
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
          <h4 className="text-white font-bold mb-4">Risorse</h4>
          <ul className="text-sm space-y-2">
            <li>
              <Link href="/news" className="hover:text-white">
                Prevenzione Truffe
              </Link>
            </li>
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
            <li>
              <Link href="/contatti" className="hover:text-white">
                Contatti
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p>© 2024 Obaldi Network. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
