"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { HeroSlide } from "@/lib/homeData";
import { FaCheck } from "react-icons/fa";

import { cn } from "@/lib/utils";

type HeroCarouselProps = {
  slides: HeroSlide[];
  className?: string;
};

const HeroCarousel = ({ slides, className }: HeroCarouselProps) => {
  const safeSlides = useMemo(() => slides ?? [], [slides]);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const active = safeSlides[activeIndex];

  const goPrev = () =>
    setActiveIndex((prev) => (prev === 0 ? safeSlides.length - 1 : prev - 1));
  const goNext = () =>
    setActiveIndex((prev) => (prev + 1) % safeSlides.length);

  if (!active) return null;

  return (
    <section
      className={cn("relative glass-card overflow-hidden py-8 md:py-16 px-5 md:px-10", className)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
        const delta = touchStartX.current - endX;
        touchStartX.current = null;
        if (Math.abs(delta) > 40) {
          if (delta > 0) {
            goNext();
          } else {
            goPrev();
          }
        }
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-slate-100/40" />
      </div>

      <div className="relative z-10 grid gap-6 md:grid-cols-[1.2fr,0.8fr] items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
            Nuova selezione Obaldi
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] leading-tight">
            {active.title}
          </h1>
          <p className="text-lg text-slate-600">{active.subtitle}</p>
          <p className="text-sm text-slate-500">{active.priceNote}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild className="rounded-full px-6 bg-[#0b224e]">
              <Link href={active.ctaHref}>{active.ctaLabel}</Link>
            </Button>
            <Link
              href="/membership"
              className="text-sm font-semibold text-[#0b224e] hover:underline"
            >
              Scopri le membership
            </Link>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="glass-panel p-6 space-y-4">
            <p className="text-sm text-slate-600">
              Selezioni curate, senza marketing aggressivo.
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><FaCheck className="text-[#0b224e]" /> Prodotti verificati dal team</li>
              <li className="flex items-center gap-2"><FaCheck className="text-[#0b224e]" /> Spedizione sempre inclusa</li>
              <li className="flex items-center gap-2"><FaCheck className="text-[#0b224e]" /> Supporto reale quando serve</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 flex items-center gap-2">
        <button
          type="button"
          aria-label="Slide precedente"
          onClick={goPrev}
          className="h-10 w-10 rounded-full bg-white/80 text-slate-700 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b224e]/30"
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Slide successiva"
          onClick={goNext}
          className="h-10 w-10 rounded-full bg-white/80 text-slate-700 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b224e]/30"
        >
          →
        </button>
      </div>
    </section>
  );
};

export default HeroCarousel;
