"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FaArrowRight, FaShieldAlt } from "react-icons/fa";

function AnimatedHero() {
    const [titleNumber, setTitleNumber] = useState(0);
    const titles = useMemo(
        () => ["trasparente", "sicura", "onesta", "semplice", "affidabile"],
        []
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (titleNumber === titles.length - 1) {
                setTitleNumber(0);
            } else {
                setTitleNumber(titleNumber + 1);
            }
        }, 2500);
        return () => clearTimeout(timeoutId);
    }, [titleNumber, titles]);

    return (
        <div className="w-full min-h-[70vh] flex items-center py-8 lg:py-16">
            <div className="container-max mx-auto page-pad">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Content */}
                    <div className="flex flex-col gap-6 lg:gap-8">
                        {/* Badge */}
                        <Link
                            href="/about"
                            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#0b224e]/5 border border-[#0b224e]/10 text-sm font-semibold text-[#0b224e] hover:bg-[#0b224e]/10 transition-colors w-fit"
                        >
                            <FaShieldAlt className="text-[#0b224e]" />
                            Chi siamo e perché esistiamo
                            <FaArrowRight className="w-3 h-3" />
                        </Link>

                        {/* Titolo Animato */}
                        <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tight font-bold">
                            <span className="text-slate-800">La spesa online</span>
                            <span className="relative flex w-full justify-start overflow-hidden md:pb-4 md:pt-2 h-[1.2em]">
                                &nbsp;
                                {titles.map((title, index) => (
                                    <motion.span
                                        key={index}
                                        className="absolute font-bold bg-gradient-to-r from-[#0b224e] to-[#1a3a6e] bg-clip-text text-transparent"
                                        initial={{ opacity: 0, y: "-100" }}
                                        transition={{ type: "spring", stiffness: 50 }}
                                        animate={
                                            titleNumber === index
                                                ? {
                                                    y: 0,
                                                    opacity: 1,
                                                }
                                                : {
                                                    y: titleNumber > index ? -150 : 150,
                                                    opacity: 0,
                                                }
                                        }
                                    >
                                        {title}
                                    </motion.span>
                                ))}
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl leading-relaxed text-slate-600 max-w-lg">
                            Prodotti reali, prezzi giusti, persone vere. Su Obaldi compri solo se vuoi farlo davvero,
                            e sai sempre cosa stai comprando.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/marketplace"
                                className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#0b224e] text-white font-semibold text-lg shadow-lg shadow-[#0b224e]/20 hover:shadow-xl hover:shadow-[#0b224e]/30 hover:scale-[1.02] transition-all duration-300"
                            >
                                Entra nel Marketplace
                                <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/membership"
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white text-[#0b224e] font-semibold text-lg border-2 border-slate-200 hover:border-[#0b224e] hover:shadow-lg transition-all duration-300"
                            >
                                Unisciti a noi
                            </Link>
                        </div>

                        {/* Trust Stats */}
                        <div className="flex gap-8 md:gap-12 pt-6 mt-2 border-t border-slate-200/60">
                            <div>
                                <div className="text-2xl md:text-3xl font-bold text-[#0b224e]">100%</div>
                                <div className="text-xs md:text-sm text-slate-500">Trasparenza</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold text-[#0b224e]">0</div>
                                <div className="text-xs md:text-sm text-slate-500">Costi nascosti</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold text-[#0b224e]">24/7</div>
                                <div className="text-xs md:text-sm text-slate-500">Supporto</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Image */}
                    <div className="relative h-[350px] md:h-[450px] lg:h-[550px] w-full group cursor-pointer">
                        <Image
                            src="/media/ProdottiSmartphone.png"
                            alt="Prodotti Obaldi"
                            fill
                            className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export { AnimatedHero };
