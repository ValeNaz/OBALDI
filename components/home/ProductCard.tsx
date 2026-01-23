import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/homeData";

type ProductCardProps = {
  product: Product;
  variant: "compact" | "full";
};

const ProductCard = ({ product, variant }: ProductCardProps) => {
  const currencySymbol = product.currency === "EUR" ? "€" : product.currency ?? "";
  const price =
    product.priceCents && product.currency
      ? `${currencySymbol}${(product.priceCents / 100).toFixed(2)}`
      : null;

  return (
    <Link
      href="/marketplace"
      className={cn(
        "group glass-panel overflow-hidden border border-white/60 bg-white/70 transition",
        "hover:-translate-y-1 hover:shadow-glow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b224e]/30",
        variant === "compact" ? "w-[220px]" : "w-[280px]"
      )}
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 60vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-[#0b224e] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            {product.badge}
          </span>
        )}
      </div>
      <div className={cn("space-y-2", variant === "compact" ? "p-4" : "p-5")}>
        <div
          className={cn(
            "text-sm font-semibold text-slate-700 leading-snug",
            variant === "full" ? "text-base" : "text-sm"
          )}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        >
          {product.title}
        </div>
        {variant === "full" && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{"★".repeat(Math.round(product.rating ?? 0))}</span>
            <span>{product.rating?.toFixed(1) ?? "0.0"}</span>
            <span>({product.ratingCount ?? 0})</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#0b224e]">{price ?? "—"}</span>
          {product.shippingNote && (
            <span className="text-[10px] uppercase tracking-wider text-slate-400">
              {product.shippingNote}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
