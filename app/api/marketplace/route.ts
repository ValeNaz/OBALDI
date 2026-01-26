import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { ProductStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const category = searchParams.get("category");

    try {
        let whereClause: any = { status: "APPROVED" };
        if (category && category !== "ALL") {
            whereClause.category = category;
        }

        const allProducts = await (prisma.product as any).findMany({
            where: whereClause,
            include: { media: { where: { type: "IMAGE" }, take: 1 } }
        });

        // 1. Hero Section
        const heroProducts = allProducts.filter((p: any) => p.isHero).slice(0, 5);

        // 2. Promo Grid
        const promoProducts = allProducts.filter((p: any) => p.isPromo).slice(0, 12);

        // 3. Split Section
        const splitProducts = allProducts.filter((p: any) => p.isSplit).slice(0, 4);

        // 4. Carousel Sections
        const carouselProducts = allProducts.filter((p: any) => p.isCarousel).slice(0, 16);

        // 5. Collection Grid
        const collectionProducts = allProducts.filter((p: any) => p.isCollection).slice(0, 12);

        // 6. Algorithm for Recommended
        let recommendedItems: any[] = [];
        let viewHistory: string[] = [];

        if (userId) {
            const recentViews = await (prisma as any).productView.findMany({
                where: { userId },
                take: 20,
                orderBy: { createdAt: "desc" }
            });
            viewHistory = Array.from(new Set(recentViews.map((v: any) => v.productId)));

            if (recentViews.length > 0) {
                const viewedData = allProducts.filter((p: any) => viewHistory.includes(p.id));
                const categoryCounts: Record<string, number> = {};
                viewedData.forEach((p: any) => {
                    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
                });
                const topCategories = Object.entries(categoryCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 2)
                    .map(([cat]) => cat);

                recommendedItems = allProducts.filter((p: any) =>
                    topCategories.includes(p.category) && !viewHistory.includes(p.id)
                ).slice(0, 8);
            }
        }

        // Fallback for recommended
        if (recommendedItems.length < 8) {
            const more = allProducts.filter((p: any) =>
                p.isFeatured &&
                !viewHistory.includes(p.id) &&
                !recommendedItems.find(r => r.id === p.id)
            ).slice(0, 8 - recommendedItems.length);
            recommendedItems = [...recommendedItems, ...more];
        }

        // 7. History Strip
        let historyItems: any[] = [];
        if (viewHistory.length > 0) {
            historyItems = viewHistory
                .map(id => allProducts.find((p: any) => p.id === id))
                .filter(Boolean)
                .slice(0, 12);
        }

        // 8. Catalog
        const catalog = [...allProducts].sort((a: any, b: any) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
            const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
            return dateB - dateA;
        }).slice(0, 32);

        const formatProduct = (p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            image: p.media[0]?.url ?? "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGMUY1RjkiLz48L3N2Zz4=",
            priceCents: p.priceCents,
            currency: p.currency,
            premiumOnly: p.premiumOnly,
            pointsEligible: p.pointsEligible,
            pointsPrice: p.pointsPrice,
            category: p.category,
            rating: 4.5,
            ratingCount: 10
        });

        return NextResponse.json({
            hero: heroProducts.map((p: any) => ({
                id: p.id,
                title: p.title,
                subtitle: p.description.substring(0, 80) + "...",
                priceNote: `Da €${(p.priceCents / 100).toFixed(0)}`,
                ctaLabel: "Dettagli",
                ctaHref: `/product/${p.id}`,
                image: p.media[0]?.url
            })),
            promo: promoProducts.map(formatProduct),
            split: splitProducts.map((p: any) => ({
                id: p.id,
                title: p.title,
                subtitle: p.description.substring(0, 60),
                image: p.media[0]?.url,
                ctaLabel: "Scopri",
                ctaHref: `/product/${p.id}`
            })),
            carousel: carouselProducts.map(formatProduct),
            collection: collectionProducts.map(formatProduct),
            recommended: recommendedItems.map(formatProduct),
            history: historyItems.map(formatProduct),
            catalog: catalog.map(formatProduct)
        });

    } catch (error: any) {
        console.error("Marketplace API error:", error);
        return NextResponse.json({
            error: "Failed to load marketplace data",
            message: error.message
        }, { status: 500 });
    }
}
