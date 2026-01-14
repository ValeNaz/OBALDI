import Link from "next/link";

export default function MembershipCancelPage() {
  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-20">
      <div className="glass-card card-pad text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[#0b224e] mb-4">
          Pagamento annullato
        </h1>
        <p className="text-slate-600 mb-8">
          Nessun addebito e&apos; stato effettuato. Puoi riprovare quando vuoi.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/membership"
            className="px-6 py-3 rounded-full bg-[#0b224e] text-white font-semibold shadow-glow-soft"
          >
            Torna ai piani
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-white/70 text-[#0b224e] font-semibold border border-white/80"
          >
            Vai alla home
          </Link>
        </div>
      </div>
    </div>
  );
}
