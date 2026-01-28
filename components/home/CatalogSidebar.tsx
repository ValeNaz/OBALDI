"use client";

import React from "react";
import { type Category } from "@/lib/homeData";

type CatalogFiltersProps = {
    categories: Category[];
    activeCategory: string;
    onCategoryChange: (id: string) => void;
    minPrice: string;
    maxPrice: string;
    onPriceChange: (min: string, max: string) => void;
    sort: string;
    onSortChange: (sort: string) => void;
    onResetFilters: () => void;
    options: Record<string, string[]>;
    selectedOptions: Record<string, string[]>;
    onOptionChange: (name: string, value: string) => void;
};

const CatalogSidebar = ({
    categories,
    activeCategory,
    onCategoryChange,
    minPrice,
    maxPrice,
    onPriceChange,
    sort,
    onSortChange,
    onResetFilters,
    options = {},
    selectedOptions = {},
    onOptionChange
}: CatalogFiltersProps) => {
    return (
        <aside className="w-full flex-shrink-0 space-y-8 animate-fade-in-soft">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0b224e] uppercase tracking-wider">Filtri</h3>
                <button
                    onClick={onResetFilters}
                    className="text-[10px] font-bold text-[#a41f2e] uppercase tracking-widest hover:underline"
                >
                    Azzera tutto
                </button>
            </div>

            {/* Sorting */}
            <div>
                <h3 className="text-sm font-bold text-[#0b224e] uppercase tracking-wider mb-4">Ordinamento</h3>
                <select
                    value={sort}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-full glass-input text-xs font-semibold"
                >
                    <option value="date-desc">Più recenti</option>
                    <option value="date-asc">Meno recenti</option>
                    <option value="price-asc">Prezzo: Crescente</option>
                    <option value="price-desc">Prezzo: Decrescente</option>
                </select>
            </div>

            {/* Categories */}
            <div>
                <h3 className="text-sm font-bold text-[#0b224e] uppercase tracking-wider mb-4">Categorie</h3>
                <div className="flex flex-col gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onCategoryChange(cat.id)}
                            className={`text-left px-5 py-3 rounded-2xl text-sm font-semibold transition-all truncate w-full ${activeCategory === cat.id
                                ? "bg-[#0b224e] text-white shadow-glow-soft"
                                : "text-slate-600 hover:bg-white hover:text-[#0b224e]"
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-sm font-bold text-[#0b224e] uppercase tracking-wider mb-4">Prezzo (€)</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => onPriceChange(e.target.value, maxPrice)}
                        className="w-full glass-input text-xs !py-2 min-w-0"
                    />
                    <span className="text-slate-400">—</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => onPriceChange(minPrice, e.target.value)}
                        className="w-full glass-input text-xs !py-2 min-w-0"
                    />
                </div>
            </div>

            {/* Dynamic Options */}
            {options && Object.keys(options).length > 0 && (
                <div className="space-y-6 pt-4 border-t border-slate-200/50">
                    {Object.entries(options).map(([optName, values]) => (
                        <div key={optName}>
                            <h3 className="text-sm font-bold text-[#0b224e] uppercase tracking-wider mb-3">{optName}</h3>
                            <div className="flex flex-wrap gap-2">
                                {values.map(val => {
                                    const isSelected = selectedOptions[optName]?.includes(val);
                                    return (
                                        <button
                                            key={val}
                                            onClick={() => onOptionChange(optName, val)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${isSelected
                                                ? "bg-[#0b224e] text-white border-[#0b224e] shadow-md"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                                                }`}
                                        >
                                            {val}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="pt-6 border-t border-slate-200/50">
                <p className="text-[10px] text-slate-400 italic">
                    * I prezzi mostrati sono comprensivi di IVA e spedizione per i membri.
                </p>
            </div>
        </aside>
    );
};

export default CatalogSidebar;
