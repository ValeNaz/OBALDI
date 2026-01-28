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
    <section className={cn("py-0", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 className="text-xl font-display font-bold text-[#0b224e]">Visti di recente</h2>
        <Link href="/profile" className="text-xs font-semibold text-slate-500 hover:text-[#0b224e] transition-colors">
          Vedi tutti
        </Link>
      </div>

      <HorizontalScroller label="Cronologia di navigazione">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.id.replace('history-', '')}`}
            className="group relative flex-shrink-0 w-32 h-32 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-[#0b224e]/20 transition-all duration-300"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          </Link>
        ))}
      </HorizontalScroller>
    </section>
  );
};

export default HistoryStrip;
