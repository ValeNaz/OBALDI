import Image from "next/image";
import Link from "next/link";
import type { PromoModule } from "@/lib/homeData";

type PromoModuleGridProps = {
  modules: PromoModule[];
};

const PromoModuleGrid = ({ modules }: PromoModuleGridProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {modules.map((module) => (
        <div
          key={module.id}
          className="glass-panel p-6 flex flex-col gap-4 hover:-translate-y-1 transition shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0b224e]">{module.title}</h3>
          </div>

          {module.kind === "resume" && (
            <div className="grid grid-cols-2 gap-3">
              {module.items.slice(0, 4).map((item) => (
                <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {module.kind === "event" && (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src={module.items[0]?.image ?? "/media/Hero_Home.png"}
                alt={module.title}
                fill
                sizes="240px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white text-sm font-semibold">
                {module.meta ?? "Live in arrivo"}
              </div>
            </div>
          )}

          {module.kind === "offers" && (
            <div className="grid grid-cols-2 gap-3">
              {module.items.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-xl overflow-hidden"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                  {item.badge && (
                    <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#0b224e]">
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {module.kind === "video" && (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src={module.items[0]?.image ?? "/media/Hero_Home.png"}
                alt={module.title}
                fill
                sizes="240px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#0b224e]">
                Guarda ora
              </span>
            </div>
          )}

          <Link
            href={module.ctaHref}
            className="text-sm font-semibold text-[#0b224e] hover:underline"
          >
            {module.ctaLabel}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default PromoModuleGrid;
