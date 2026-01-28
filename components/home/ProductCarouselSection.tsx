import Link from "next/link";
import type { CarouselSection } from "@/lib/homeData";
import HorizontalScroller from "@/components/home/HorizontalScroller";
import ProductCard from "@/components/home/ProductCard";

import { cn } from "@/lib/utils";

type ProductCarouselSectionProps = {
  section: CarouselSection;
  isLoading?: boolean;
  className?: string;
};

const ProductCarouselSection = ({ section, isLoading = false, className }: ProductCarouselSectionProps) => {
  return (
    <section className={cn("py-0", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-2xl font-semibold text-[#0b224e]">{section.title}</h2>
          {section.pageLabel && (
            <p className="text-xs text-slate-400 mt-1">{section.pageLabel}</p>
          )}
        </div>
        {section.ctaLabel && section.ctaHref && (
          <Link href={section.ctaHref} className="text-sm font-semibold text-[#0b224e] hover:underline">
            {section.ctaLabel}
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`skeleton-${section.id}-${index}`}
              className="h-56 w-[220px] animate-pulse rounded-2xl bg-white/60"
            />
          ))}
        </div>
      ) : (
        <HorizontalScroller label={section.title}>
          {section.items.map((product) => (
            <ProductCard key={product.id} product={product} variant={section.variant} />
          ))}
        </HorizontalScroller>
      )}
    </section>
  );
};

export default ProductCarouselSection;
