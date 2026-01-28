"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type MediaType = "IMAGE" | "VIDEO";

type ProductMedia = {
    id: string;
    url: string;
    type: MediaType;
    sortOrder: number;
};

export default function ProductCarousel({ media, selectedIndex }: { media: ProductMedia[], selectedIndex?: number | null }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Sync with external selectedIndex
    if (selectedIndex !== undefined && selectedIndex !== null && selectedIndex !== currentIndex && selectedIndex < media.length) {
        setCurrentIndex(selectedIndex);
    }

    if (!media || media.length === 0) {
        return (
            <div className="aspect-square bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300">
                No Images
            </div>
        );
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % media.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    };

    const currentMedia = media[currentIndex];

    return (
        <div className="space-y-4">
            <div className="relative aspect-square md:aspect-[4/3] w-full rounded-3xl overflow-hidden bg-white/50 border border-white/60 shadow-sm group">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentMedia.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                    >
                        {currentMedia.type === "VIDEO" ? (
                            <video
                                src={currentMedia.url}
                                controls
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Image
                                src={currentMedia.url}
                                alt="Product Image"
                                fill
                                className="object-cover"
                                priority
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {media.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 backdrop-blur text-[#0b224e] opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-white"
                        >
                            <FaChevronLeft />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 backdrop-blur text-[#0b224e] opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-white"
                        >
                            <FaChevronRight />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {media.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {media.map((item, idx) => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${idx === currentIndex ? "border-[#0b224e]" : "border-transparent opacity-70 hover:opacity-100"
                                }`}
                        >
                            {item.type === "VIDEO" ? (
                                <video
                                    src={item.url}
                                    className="w-full h-full object-cover pointer-events-none"
                                />
                            ) : (
                                <Image
                                    src={item.url}
                                    alt="Thumbnail"
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
