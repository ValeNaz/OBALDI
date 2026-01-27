"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaTrash, FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import StarRating from "@/components/reviews/StarRating";

interface WishlistItem {
    id: string;
    productId: string;
    addedAt: string;
    product: {
        id: string;
        title: string;
        description: string;
        priceCents: number;
        currency: string;
        isOutOfStock: boolean;
        premiumOnly: boolean;
        pointsEligible: boolean;
        image: string | null;
    };
}

const WishlistPage = () => {
    const { user } = useUser();
    const { addItem } = useCart();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        try {
            const res = await fetch("/api/me/wishlist");
            const data = await res.json();
            setItems(data.items || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRemove = async (productId: string) => {
        try {
            await fetch(`/api/me/wishlist?productId=${productId}`, { method: "DELETE" });
            setItems((prev) => prev.filter((i) => i.product.id !== productId));
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddToCart = (item: WishlistItem) => {
        addItem({
            productId: item.product.id,
            title: item.product.title,
            priceCents: item.product.priceCents,
            currency: item.product.currency,
            image: item.product.image || "https://picsum.photos/seed/obaldi/400/300",
            qty: 1,
            premiumOnly: item.product.premiumOnly,
            pointsEligible: false, // Defaulting, ideally should come from API
            pointsPrice: null
        });
    };

    if (!user) {
        return (
            <div className="container-max page-pad pt-32 pb-16 text-center">
                <h1 className="text-3xl font-display font-bold text-[#0b224e] mb-4">La tua Wishlist</h1>
                <p className="text-slate-500 mb-8">Accedi per visualizzare la tua lista dei desideri.</p>
                <Link href="/login" className="px-6 py-2 bg-[#0b224e] text-white rounded-full font-bold">
                    Accedi
                </Link>
            </div>
        );
    }

    return (
        <div className="container-max page-pad pt-28 md:pt-32 pb-16">
            <h1 className="text-4xl font-display font-bold text-[#0b224e] mb-2">La tua Wishlist</h1>
            <p className="text-slate-500 mb-10">Salva i tuoi prodotti preferiti per dopo.</p>

            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-2xl" />)}
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-lg text-slate-500 mb-6">La tua wishlist è vuota.</p>
                    <Link href="/marketplace" className="px-8 py-3 bg-[#0b224e] text-white rounded-full font-bold shadow-glow-soft">
                        Esplora il Marketplace
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((item) => (
                        <div key={item.id} className="group glass-panel overflow-hidden flex flex-col h-full hover:shadow-lg transition">
                            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                                <Image
                                    src={item.product.image || "https://picsum.photos/seed/obaldi/400/300"}
                                    alt={item.product.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition duration-500"
                                />
                                {item.product.isOutOfStock && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                        <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">ESAURITO</span>
                                    </div>
                                )}
                                <button
                                    onClick={(e) => { e.preventDefault(); handleRemove(item.product.id); }}
                                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-slate-400 hover:text-red-500 transition shadow-sm z-10"
                                    title="Rimuovi"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <Link href={`/product/${item.product.id}`} className="block mb-2 text-lg font-bold text-[#0b224e] hover:text-[#1a3a6e] line-clamp-1">
                                    {item.product.title}
                                </Link>
                                <div className="font-bold text-slate-900 mb-4">
                                    €{(item.product.priceCents / 100).toFixed(2)}
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-50">
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        disabled={item.product.isOutOfStock}
                                        className="w-full py-2 bg-[#0b224e] text-white text-sm font-bold rounded-lg hover:bg-[#1a3a6e] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <FaShoppingCart size={14} />
                                        {item.product.isOutOfStock ? "Non disponibile" : "Aggiungi al carrello"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
