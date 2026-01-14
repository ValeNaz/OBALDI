import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold mb-4 italic text-xl">Obaldi</h3>
          <p className="text-sm">Consapevolezza. Tutela. Acquisti sensati.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Risorse</h4>
          <ul className="text-sm space-y-2">
            <li>
              <Link href="/news/truffe" className="hover:text-white">
                Prevenzione Truffe
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
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
