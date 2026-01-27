"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface Feature {
    step: string
    title?: string
    content: string
    image: string
}

interface FeatureStepsProps {
    features: Feature[]
    className?: string
    title?: string
    autoPlayInterval?: number
    imageHeight?: string
}

export function FeatureSteps({
    features,
    className,
    title = "Come funziona",
    autoPlayInterval = 4000,
    imageHeight = "h-[400px]",
}: FeatureStepsProps) {
    const [currentFeature, setCurrentFeature] = useState(0)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            if (progress < 100) {
                setProgress((prev) => prev + 100 / (autoPlayInterval / 100))
            } else {
                setCurrentFeature((prev) => (prev + 1) % features.length)
                setProgress(0)
            }
        }, 100)

        return () => clearInterval(timer)
    }, [progress, features.length, autoPlayInterval])

    return (
        <div className={cn("p-8 md:p-12", className)}>
            <div className="max-w-7xl mx-auto w-full">
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-12 text-center text-[#0b224e]">
                    {title}
                </h2>

                <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12">
                    {/* Steps */}
                    <div className="order-2 md:order-1 space-y-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className={cn(
                                    "flex items-start gap-5 p-6 rounded-2xl cursor-pointer transition-all duration-300",
                                    index === currentFeature
                                        ? "bg-white shadow-lg border border-slate-200"
                                        : "hover:bg-slate-50"
                                )}
                                initial={{ opacity: 0.5 }}
                                animate={{ opacity: index === currentFeature ? 1 : 0.6 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => {
                                    setCurrentFeature(index)
                                    setProgress(0)
                                }}
                            >
                                <motion.div
                                    className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 transition-all duration-300",
                                        index === currentFeature
                                            ? "bg-[#0b224e] text-white scale-110"
                                            : index < currentFeature
                                                ? "bg-emerald-500 text-white"
                                                : "bg-slate-200 text-slate-600"
                                    )}
                                >
                                    {index < currentFeature ? (
                                        <span className="text-lg">✓</span>
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </motion.div>

                                <div className="flex-1">
                                    <h3 className={cn(
                                        "text-xl font-semibold transition-colors duration-300",
                                        index === currentFeature ? "text-[#0b224e]" : "text-slate-600"
                                    )}>
                                        {feature.title || feature.step}
                                    </h3>
                                    <p className={cn(
                                        "text-sm mt-2 leading-relaxed transition-colors duration-300",
                                        index === currentFeature ? "text-slate-600" : "text-slate-400"
                                    )}>
                                        {feature.content}
                                    </p>

                                    {/* Progress bar for active step */}
                                    {index === currentFeature && (
                                        <div className="mt-4 h-1 bg-slate-200 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-[#0b224e] rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.1, ease: "linear" }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Image */}
                    <div
                        className={cn(
                            "order-1 md:order-2 relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-3xl shadow-2xl"
                        )}
                    >
                        <AnimatePresence mode="wait">
                            {features.map(
                                (feature, index) =>
                                    index === currentFeature && (
                                        <motion.div
                                            key={index}
                                            className="absolute inset-0 rounded-3xl overflow-hidden"
                                            initial={{ y: 50, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -50, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: "easeInOut" }}
                                        >
                                            <Image
                                                src={feature.image}
                                                alt={feature.step}
                                                fill
                                                className="object-contain transition-transform duration-500"
                                            />
                                        </motion.div>
                                    )
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
