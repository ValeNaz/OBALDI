"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/lib/homeData";

type InfiniteMarqueeProps = {
    items: Product[];
    isLoading?: boolean;
};

const InfiniteMarquee = ({ items, isLoading = false }: InfiniteMarqueeProps) => {
    if (isLoading) {
        return (
            <div className="flex gap-6 overflow-hidden py-10">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="min-w-[280px] h-[360px] bg-white/40 animate-pulse rounded-3xl shrink-0" />
                ))}
            </div>
        );
    }

    // Duplicate items for seamless loop
    const displayItems = [...items, ...items];

    return (
        <div className="relative w-full overflow-hidden bg-white/30 backdrop-blur-sm rounded-[3rem] py-10 border border-white/50 shadow-inner mt-4 mb-10">
            <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 60s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

            <div className="animate-marquee flex gap-10">
                {displayItems.map((product, idx) => (
                    <div
                        key={`${product.id}-${idx}`}
                        className="min-w-[300px] group transition-all duration-500 hover:scale-[1.02]"
                    >
                        <Link href={`/product/${product.id}`} className="block">
                            <div className="relative h-[380px] w-full overflow-hidden rounded-[2.5rem] shadow-2xl glass-hover bg-slate-200">
                                <Image
                                    src={product.image}
                                    alt=""
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                    sizes="300px"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0b224e]/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                <div className="absolute bottom-0 left-0 right-0 p-8 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    {product.pointsEligible && product.pointsPrice ? (
                                        <span className="inline-block px-3 py-1 bg-[#a41f2e]/90 text-white backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                                            Usa fino a {product.pointsPrice} punti
                                        </span>
                                    ) : product.premiumOnly ? (
                                        <span className="inline-block px-3 py-1 bg-[#0b224e]/90 text-white backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                                            Premium Only
                                        </span>
                                    ) : null}
                                    <h3 className="text-xl font-bold mb-1 drop-shadow-md">
                                        {product.title}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <p className="text-2xl font-display font-bold text-white">
                                            €{((product.priceCents || 0) / 100).toFixed(0)}
                                        </p>
                                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#0b224e] shadow-glow-soft opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                                            →
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InfiniteMarquee;
