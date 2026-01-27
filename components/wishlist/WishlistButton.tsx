"use client";

import { useState, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useUser } from "@/context/UserContext";

interface WishlistButtonProps {
    productId: string;
    className?: string;
}

const WishlistButton = ({ productId, className = "" }: WishlistButtonProps) => {
    const { user } = useUser();
    const [inWishlist, setInWishlist] = useState(false);
    const [loading, setLoading] = useState(false);

    // Ideally prompt user to login if not logged in
    // For now just disable or show generic state

    useEffect(() => {
        if (!user) return;

        // Check if in wishlist
        // We can fetch all wishlist or specific. 
        // Optimization: fetch user wishlist context or verify efficiently.
        // For now simplistic fetch check for THIS product on mount.
        // Since /api/me/wishlist returns list, we can use that.

        const checkStatus = async () => {
            try {
                const res = await fetch("/api/me/wishlist");
                const data = await res.json();
                if (data.items) {
                    const exists = data.items.some((item: any) => item.productId === productId);
                    setInWishlist(exists);
                }
            } catch (e) { console.error(e); }
        };

        checkStatus();
    }, [user, productId]);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) {
            alert("Accedi per salvare nei preferiti.");
            return;
        }

        setLoading(true);
        try {
            if (inWishlist) {
                // Remove
                await fetch(`/api/me/wishlist?productId=${productId}`, { method: "DELETE" });
                setInWishlist(false);
            } else {
                // Add
                const res = await fetch("/api/me/wishlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId })
                });
                if (res.ok) setInWishlist(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleWishlist}
            disabled={loading}
            className={`
        p-2 rounded-full transition-all flex items-center justify-center
        ${inWishlist ? "text-red-500 bg-red-50" : "text-slate-400 bg-slate-100 hover:text-red-500 hover:bg-red-50"}
        ${className}
      `}
            title={inWishlist ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
        >
            {inWishlist ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
        </button>
    );
};

export default WishlistButton;
