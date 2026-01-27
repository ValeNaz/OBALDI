"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Integration {
    name: string
    logo: string
    link?: string
}

interface IntegrationsGridProps {
    integrations: Integration[]
    title?: string
    subtitle?: string
    description?: string
    className?: string
    ctaText?: string
    ctaLink?: string
}

export function IntegrationsGrid({
    integrations,
    title = "Partner del territorio",
    subtitle = "Collaborazioni",
    description = "Lavoriamo con realtà locali per offrirti prodotti genuini e prezzi onesti.",
    className,
    ctaText = "Scopri di più",
    ctaLink = "/about",
}: IntegrationsGridProps) {
    return (
        <section className={cn("max-w-6xl mx-auto py-16 px-6", className)}>
            <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left Side - Text */}
                <div>
                    <p className="uppercase text-xs font-semibold tracking-widest text-[#0b224e]/60 mb-3">
                        {subtitle}
                    </p>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] mb-6 leading-tight">
                        {title}
                    </h2>
                    <p className="text-slate-600 text-lg leading-relaxed mb-8">
                        {description}
                    </p>
                    <div className="flex gap-4 flex-wrap">
                        <Link
                            href={ctaLink}
                            className="inline-block bg-[#0b224e] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0b224e]/90 transition-all hover:shadow-lg hover:scale-105"
                        >
                            {ctaText}
                        </Link>
                    </div>
                </div>

                {/* Right Side - Logo Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                    {integrations.map((item, idx) => (
                        <div
                            key={idx}
                            className="group relative aspect-square bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-[#0b224e]/20 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center p-3"
                        >
                            <Image
                                src={item.logo}
                                alt={item.name}
                                width={48}
                                height={48}
                                className="object-contain opacity-70 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                            />

                            {/* Tooltip */}
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#0b224e] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {item.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
