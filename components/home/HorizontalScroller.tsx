"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type HorizontalScrollerProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
};

const HorizontalScroller = ({
  label,
  children,
  className,
  itemClassName
}: HorizontalScrollerProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateState = () => {
    const node = scrollRef.current;
    if (!node) return;
    const maxScrollLeft = node.scrollWidth - node.clientWidth;
    setCanScrollPrev(node.scrollLeft > 0);
    setCanScrollNext(node.scrollLeft < maxScrollLeft - 1);
  };

  const handleScroll = (direction: "prev" | "next") => {
    const node = scrollRef.current;
    if (!node) return;
    const delta = node.clientWidth * 0.8;
    node.scrollBy({ left: direction === "next" ? delta : -delta, behavior: "smooth" });
  };

  const handleKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      handleScroll("next");
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      handleScroll("prev");
    }
  };

  useEffect(() => {
    updateState();
    const node = scrollRef.current;
    if (!node) return undefined;

    const onScroll = () => updateState();
    node.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateState);

    return () => {
      node.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateState);
    };
  }, []);

  return (
    <div className={cn("relative pt-12", className)}>
      <div className="absolute right-2 top-0 flex gap-2">
        <button
          type="button"
          aria-label={`${label}: scorri a sinistra`}
          onClick={() => handleScroll("prev")}
          disabled={!canScrollPrev}
          className={cn(
            "h-9 w-9 rounded-full border border-white/70 bg-white/80 text-slate-700 shadow-sm transition",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b224e]/30",
            canScrollPrev ? "hover:bg-white" : "opacity-50 cursor-not-allowed"
          )}
        >
          ←
        </button>
        <button
          type="button"
          aria-label={`${label}: scorri a destra`}
          onClick={() => handleScroll("next")}
          disabled={!canScrollNext}
          className={cn(
            "h-9 w-9 rounded-full border border-white/70 bg-white/80 text-slate-700 shadow-sm transition",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b224e]/30",
            canScrollNext ? "hover:bg-white" : "opacity-50 cursor-not-allowed"
          )}
        >
          →
        </button>
      </div>

      <div
        ref={scrollRef}
        role="group"
        aria-label={label}
        tabIndex={0}
        onKeyDown={handleKey}
        className={cn(
          "flex gap-4 overflow-x-auto scroll-smooth pb-2 pr-2 focus-visible:outline-none",
          itemClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default HorizontalScroller;
