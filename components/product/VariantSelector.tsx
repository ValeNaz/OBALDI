"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ProductOption = {
    id: string;
    name: string;
    values: string[];
};

export type ProductVariant = {
    id: string;
    title: string;
    sku: string | null;
    priceCents: number | null;
    stockQty: number;
    attributesJson: any;
    mediaIndex: number | null;
};

type VariantSelectorProps = {
    options: ProductOption[];
    variants: ProductVariant[];
    onVariantChange: (variant: ProductVariant | null) => void;
};

export default function VariantSelector({ options, variants, onVariantChange }: VariantSelectorProps) {
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

    // Initialize with first available values if only 1 option? Or keep empty?
    // Let's keep empty to force selection, or select first valid variant.
    // Better UX: Don't pre-select if generic.

    useEffect(() => {
        // Find matching variant
        if (Object.keys(selectedOptions).length !== options.length) {
            onVariantChange(null);
            return;
        }

        const matched = variants.find(v => {
            const attrs = v.attributesJson as Record<string, string>;
            return Object.entries(selectedOptions).every(([k, val]) => attrs[k] === val);
        });

        onVariantChange(matched || null);
    }, [selectedOptions, options.length, variants, onVariantChange]);

    const handleSelect = (optionName: string, value: string) => {
        const newSelection = { ...selectedOptions, [optionName]: value };
        setSelectedOptions(newSelection);
    };

    const isOptionValueAvailable = (optionName: string, value: string) => {
        // Check if this value leads to any existing variant given CURRENT OTHER selections
        // For simplicity in v1, we just check if any variant has this value for this option.
        // True "linked options" logic is complex (if I select Red, are S/M/L available?).
        // Let's implement strict check:
        // Clone selection, set this value, check if any variant matches this PARTIAL selection.
        // Actually, usually we only validate against *already selected* parent options, OR we just check if it exists in any variant.

        // Simple verification: Is there any variant with this option value?
        // Improve: If I have Size selected, and I'm looking at Colors, show only Colors available for that Size.
        // Let's do: Check viability against *other* currently selected options.

        const potentialSelection = { ...selectedOptions, [optionName]: value };
        // We want to see if there is AT LEAST ONE variant that matches this subset.
        return variants.some(v => {
            const attrs = v.attributesJson as Record<string, string>;
            return Object.entries(potentialSelection).every(([k, val]) => attrs[k] === val);
        });
    };

    if (!options || options.length === 0) return null;

    return (
        <div className="space-y-6">
            {options.map((option) => (
                <div key={option.id || option.name}>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">{option.name}</h3>
                    <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                            const isActive = selectedOptions[option.name] === value;
                            // const isAvailable = isOptionValueAvailable(option.name, value); // TODO: Refine availability logic
                            // For now assume all options listed are valid roots, detailed checking can be tricky with cross-dependencies.
                            // Let's simplify: Always enabled, show visual feedback if selected combo is unavailable later? 
                            // Or better: Checking availability is good.

                            return (
                                <button
                                    key={value}
                                    onClick={() => handleSelect(option.name, value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition border ${isActive
                                        ? "bg-[#0b224e] text-white border-[#0b224e] shadow-md"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                                        }`}
                                >
                                    {value}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
