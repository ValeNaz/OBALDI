"use client";

import { useState, useEffect } from "react";
import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";
import { useUser } from "@/context/UserContext";

interface Review {
    id: string;
    rating: number;
    title?: string;
    body?: string;
    isVerified: boolean;
    createdAt: string;
    user: {
        name: string;
        avatarUrl?: string;
    };
}

interface ReviewListProps {
    productId: string;
}

const ReviewList = ({ productId }: ReviewListProps) => {
    const { user } = useUser();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [canReview, setCanReview] = useState<{ allowed: boolean; orderId?: string }>({ allowed: false });

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/products/${productId}/reviews`);
            const data = await res.json();
            setReviews(data.reviews || []);
            setStats(data.stats || { averageRating: 0, totalReviews: 0 });
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const checkEligibility = async () => {
        if (!user) return;
        try {
            // Check if user has orders for this product
            // Ideally we should have a specific endpoint for this eligibility check
            // For now let's assume if they bought it they can review it.
            // We'll rely on the API to reject if not allowed, but for UI we need to know.
            // Let's implement a quick check API route or use existing orders API.
            // SIMPLIFICATION: User will see "Write Review" button, if they click and API rejects, we show error.
            // BETTER: Check orders API filtering by product.

            const res = await fetch("/api/orders");
            const data = await res.json();
            if (data.orders) {
                // Find a paid order containing this product that hasn't been reviewed yet?
                // The API /api/products/[id]/reviews only returns list.
                // Let's just allow trying to review, the form handles the error.
                // But we need a valid orderId. 
                // Iterate orders to find one with this product.
                const order = data.orders.find((o: any) =>
                    o.status === "PAID" &&
                    o.items.some((i: any) => i.product.id === productId)
                );

                if (order) {
                    setCanReview({ allowed: true, orderId: order.id });
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchReviews();
        if (user) checkEligibility();
    }, [productId, user]);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[#0b224e]">Recensioni Clienti</h2>
                    <div className="flex items-center gap-3 mt-2">
                        <StarRating rating={stats.averageRating} size={20} />
                        <span className="text-lg font-bold text-[#0b224e]">{stats.averageRating.toFixed(1)}</span>
                        <span className="text-slate-500">({stats.totalReviews} recensioni)</span>
                    </div>
                </div>

                {canReview.allowed && !showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-6 py-2 rounded-full bg-white border-2 border-[#0b224e] text-[#0b224e] font-bold hover:bg-[#0b224e] hover:text-white transition"
                    >
                        Scrivi una recensione
                    </button>
                )}
            </div>

            {showForm && canReview.orderId && (
                <ReviewForm
                    productId={productId}
                    orderId={canReview.orderId}
                    onSuccess={() => {
                        setShowForm(false);
                        fetchReviews();
                    }}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                                    {review.user.avatarUrl ? (
                                        <img src={review.user.avatarUrl} alt={review.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        review.user.name.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-[#0b224e]">{review.user.name}</div>
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={review.rating} size={12} />
                                        {review.isVerified && (
                                            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Acquisto Verificato</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-slate-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        {review.title && <h4 className="font-bold text-[#0b224e] mb-1">{review.title}</h4>}
                        {review.body && <p className="text-slate-600 text-sm leading-relaxed">{review.body}</p>}
                    </div>
                ))}

                {!loading && reviews.length === 0 && (
                    <div className="text-center py-10 text-slate-400 italic">
                        Nessuna recensione ancora. Sii il primo a recensire questo prodotto!
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewList;
