"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface Feature {
    step: string
    title: string
    content: string
}

interface FeatureStepsMinimalProps {
    features: Feature[]
    className?: string
    title?: string
    subtitle?: string
    autoPlayInterval?: number
    image?: string
    imageAlt?: string
}

export function FeatureStepsMinimal({
    features,
    className,
    title = "Come funziona",
    subtitle,
    autoPlayInterval = 4000,
    image,
    imageAlt = "Feature image",
}: FeatureStepsMinimalProps) {
    const [currentFeature, setCurrentFeature] = useState(0)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentFeature((prev) => (prev + 1) % features.length);
        }, autoPlayInterval);

        return () => clearTimeout(timer);
    }, [currentFeature, features.length, autoPlayInterval]);

    return (
        <div className={cn("py-12 md:py-20", className)}>
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] mb-4">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Content - with optional image */}
                <div className={cn(
                    "grid gap-8 lg:gap-12 items-center",
                    image ? "lg:grid-cols-2" : "max-w-3xl mx-auto"
                )}>
                    {/* Image (optional) */}
                    {image && (
                        <div className="relative h-[350px] md:h-[450px] w-full group order-2 lg:order-1">
                            <Image
                                src={image}
                                alt={imageAlt}
                                fill
                                className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                    )}

                    {/* Steps */}
                    <div className={cn("space-y-4", image ? "order-1 lg:order-2" : "")}>
                        {features.map((feature, index) => {
                            const isActive = index === currentFeature
                            const isCompleted = index < currentFeature

                            return (
                                <motion.div
                                    key={index}
                                    className={cn(
                                        "relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border",
                                        isActive
                                            ? "bg-white shadow-xl border-[#0b224e]/20"
                                            : "bg-slate-50/50 border-transparent hover:bg-white hover:shadow-md"
                                    )}
                                    initial={{ opacity: 0.7 }}
                                    animate={{ opacity: isActive ? 1 : 0.7 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => {
                                        setCurrentFeature(index)
                                        setProgress(0)
                                    }}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Step indicator */}
                                        <div
                                            className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-300",
                                                isActive
                                                    ? "bg-[#0b224e] text-white scale-110"
                                                    : isCompleted
                                                        ? "bg-emerald-500 text-white"
                                                        : "bg-slate-200 text-slate-500"
                                            )}
                                        >
                                            {isCompleted ? "✓" : index + 1}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h3
                                                className={cn(
                                                    "text-lg font-semibold transition-colors duration-300",
                                                    isActive ? "text-[#0b224e]" : "text-slate-600"
                                                )}
                                            >
                                                {feature.title}
                                            </h3>

                                            {/* Expandable content */}
                                            <motion.div
                                                initial={false}
                                                animate={{
                                                    height: isActive ? "auto" : 0,
                                                    opacity: isActive ? 1 : 0,
                                                    marginTop: isActive ? 8 : 0
                                                }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <p className="text-slate-600 text-sm leading-relaxed">
                                                    {feature.content}
                                                </p>
                                            </motion.div>

                                            {/* Progress bar */}
                                            {isActive && (
                                                <div className="mt-4 h-1 bg-slate-200 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-[#0b224e] rounded-full"
                                                        initial={{ width: "0%" }}
                                                        animate={{ width: "100%" }}
                                                        transition={{ duration: autoPlayInterval / 1000, ease: "linear" }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
