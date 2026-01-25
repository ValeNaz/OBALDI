"use client";

import Image from "next/image";
import Link from "next/link";
import type { HistoryItem } from "@/lib/homeData";
import HorizontalScroller from "@/components/home/HorizontalScroller";

import { cn } from "@/lib/utils";

type HistoryStripProps = {
  items: HistoryItem[];
  className?: string;
};

const HistoryStrip = ({ items, className }: HistoryStripProps) => {
  return (
    <section className={cn("section-pad", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#0b224e]">Cronologia di navigazione</h2>
          <p className="text-xs text-slate-400 mt-1">Pagina 1 di 3</p>
        </div>
        <Link href="/profile" className="text-sm font-semibold text-[#0b224e] hover:underline">
          Visualizza o modifica
        </Link>
      </div>

      <HorizontalScroller label="Cronologia di navigazione">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.id.replace('history-', '')}`}
            className="glass-panel w-24 h-24 overflow-hidden flex items-center justify-center group flex-shrink-0"
          >
            <Image
              src={item.image}
              alt={item.title}
              width={96}
              height={96}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </Link>
        ))}
      </HorizontalScroller>
    </section>
  );
};

export default HistoryStrip;
