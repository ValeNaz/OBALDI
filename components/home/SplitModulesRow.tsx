import Image from "next/image";
import Link from "next/link";
import type { SplitModule } from "@/lib/homeData";

type SplitModulesRowProps = {
  featured: SplitModule;
  side: SplitModule[];
};

const SplitModulesRow = ({ featured, side }: SplitModulesRowProps) => {
  return (
    <section className="section-pad">
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-2xl font-semibold">{featured.title}</h3>
              <p className="text-sm text-white/80">{featured.subtitle}</p>
            </div>
          </div>
          <Link
            href={featured.ctaHref}
            className="text-sm font-semibold text-[#0b224e] hover:underline"
          >
            {featured.ctaLabel}
          </Link>
        </div>

        <div className="grid gap-6">
          {side.map((item) => (
            <div key={item.id} className="glass-panel p-6 flex flex-col gap-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-xs text-white/80">{item.subtitle}</p>
                </div>
              </div>
              <Link
                href={item.ctaHref}
                className="text-sm font-semibold text-[#0b224e] hover:underline"
              >
                {item.ctaLabel}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SplitModulesRow;
