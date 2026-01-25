import { PrismaClient, ProductStatus, ProductCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Cleaning product database...");

    // Ordered deletion to avoid foreign key issues
    if ((prisma as any).productView) await (prisma as any).productView.deleteMany({});
    if ((prisma as any).productMedia) await (prisma as any).productMedia.deleteMany({});
    if ((prisma as any).orderItem) await (prisma as any).orderItem.deleteMany({});
    if ((prisma as any).changeRequest) await (prisma as any).changeRequest.deleteMany({});
    await prisma.product.deleteMany({});

    console.log("Seeding marketplace with verified working images...");

    const user = await prisma.user.findFirst({
        where: { role: "ADMIN" }
    });

    if (!user) {
        console.error("No admin user found.");
        return;
    }

    const sellerId = user.id;

    // Use verified active Unsplash IDs
    const products = [
        // HERO SECTION
        {
            title: "Obaldi Vision X",
            description: "Il futuro della realtà aumentata. Leggero, potente e con un ecosistema di app integrato.",
            priceCents: 149900,
            category: ProductCategory.ELECTRONICS,
            isHero: true,
            isFeatured: true,
            media: "photo-1622979135225-d2ba269cf1ac"
        },
        {
            title: "Smart Kitchen Pro",
            description: "Robot da cucina multifunzione con intelligenza artificiale per ricette perfette.",
            priceCents: 89900,
            category: ProductCategory.HOME,
            isHero: true,
            isFeatured: true,
            media: "photo-1556910103-1c02745aae4d"
        },
        // PROMO SECTION
        {
            title: "Zaino Urban Tech",
            description: "Design minimale, massima resistenza. Comparto tech protetto e ricarica USB integrata.",
            priceCents: 12900,
            category: ProductCategory.FASHION,
            isPromo: true,
            media: "photo-1553062407-98eeb64c6a62"
        },
        {
            title: "Audio Sphere 360",
            description: "Suono avvolgente in ogni angolo della stanza con il nuovo speaker wireless.",
            priceCents: 24900,
            category: ProductCategory.ELECTRONICS,
            isPromo: true,
            media: "photo-1545454675-3531b543be5d"
        },
        {
            title: "Skin Care Ritual",
            description: "Set completo per la cura del viso con ingredienti biologici certificati.",
            priceCents: 7500,
            category: ProductCategory.BEAUTY,
            isPromo: true,
            media: "photo-1556228448-43da2d01150c"
        },
        {
            title: "Yoga Flow Mat",
            description: "Tappetino professionale antiscivolo con linee di allineamento laser.",
            priceCents: 5500,
            category: ProductCategory.SPORTS,
            isPromo: true,
            media: "photo-1517836357463-d25dfeac3438"
        },
        // SPLIT SECTION
        {
            title: "Obaldi Home Office",
            description: "La postazione di lavoro definitiva. Ergonomia e stile senza compromessi.",
            priceCents: 125000,
            category: ProductCategory.HOME,
            isSplit: true,
            isFeatured: true,
            media: "photo-1524758631624-e2822e304c36"
        },
        {
            title: "Podcast Mic Platinum",
            description: "Audio cristallino per i tuoi contenuti professionali.",
            priceCents: 32000,
            category: ProductCategory.ELECTRONICS,
            isSplit: true,
            media: "photo-1590652764285-29a99d77c5f2"
        },
        {
            title: "Essential Watch",
            description: "Eleganza senza tempo. Movimento svizzero e materiali pregiati.",
            priceCents: 45000,
            category: ProductCategory.FASHION,
            isSplit: true,
            media: "photo-1523275335684-37898b6baf30"
        },
        // CAROUSEL SECTION
        {
            title: "Smart Lamp Aurora",
            description: "Luce dinamica che si adatta al tuo ritmo circadiano.",
            priceCents: 8900,
            category: ProductCategory.HOME,
            isCarousel: true,
            media: "photo-1507413245164-6160d8298b31"
        },
        {
            title: "Fitness Tracker V2",
            description: "Monitoraggio avanzato della salute e del sonno.",
            priceCents: 11900,
            category: ProductCategory.SPORTS,
            isCarousel: true,
            media: "photo-1571019613454-1cb2f99b2d8b"
        },
        {
            title: "Coffee Master Elite",
            description: "Caffè di qualità barista direttamente a casa tua.",
            priceCents: 29900,
            category: ProductCategory.HOME,
            isCarousel: true,
            media: "photo-1495474472287-4d71bcdd2085"
        },
        {
            title: "Travel Tech Case",
            description: "Tutto il necessario per i tuoi dispositivi, organizzato e protetto.",
            priceCents: 4500,
            category: ProductCategory.ELECTRONICS,
            isCarousel: true,
            media: "photo-1512331283953-19967202267a"
        },
        // COLLECTION SECTION
        {
            title: "Premium Leather Wallet",
            description: "Pelle conciata al vegetale, sottile e capiente.",
            priceCents: 8500,
            category: ProductCategory.FASHION,
            isCollection: true,
            media: "photo-1627123424574-724758594e93"
        },
        {
            title: "Silk Sleep Mask",
            description: "Il massimo della morbidezza per un riposo imbattibile.",
            priceCents: 3500,
            category: ProductCategory.BEAUTY,
            isCollection: true,
            media: "photo-1600880292203-757bb62b4baf"
        },
        {
            title: "Copper Water Bottle",
            description: "Proprietà antibatteriche naturali e design iconico.",
            priceCents: 4900,
            category: ProductCategory.OTHER,
            isCollection: true,
            media: "photo-1523362628745-0c100150b504"
        },
        {
            title: "Desktop Grove",
            description: "Piccolo ecosistema per la tua scrivania.",
            priceCents: 6500,
            category: ProductCategory.HOME,
            isCollection: true,
            media: "photo-1485841890310-6a055c88698a"
        },
        // ADDITIONAL CATALOG ITEMS
        {
            title: "Minimalist Poster Set",
            description: "Arte per ispirare il tuo spazio creativo.",
            priceCents: 3900,
            category: ProductCategory.OTHER,
            media: "photo-1513519247388-4e284042ff7b"
        },
        {
            title: "High-End Headphones",
            description: "Qualità audio professionale per audiofili.",
            priceCents: 59900,
            category: ProductCategory.ELECTRONICS,
            media: "photo-1505740420928-5e560c06d30e"
        }
    ];

    for (const item of products) {
        const product = await (prisma.product as any).create({
            data: {
                sellerId,
                title: item.title,
                description: item.description,
                priceCents: item.priceCents,
                category: item.category,
                status: "APPROVED",
                isHero: (item as any).isHero || false,
                isPromo: (item as any).isPromo || false,
                isSplit: (item as any).isSplit || false,
                isCarousel: (item as any).isCarousel || false,
                isCollection: (item as any).isCollection || false,
                isFeatured: (item as any).isFeatured || false,
                specsJson: {},
                media: {
                    create: {
                        // Standard Unsplash serving URL format
                        url: `https://images.unsplash.com/${item.media}?auto=format&fit=crop&q=80&w=1200`,
                        type: "IMAGE",
                        sortOrder: 1
                    }
                }
            }
        });
        console.log(`Created: ${product.title}`);
    }

    console.log("Database successfully repopulated with fixed images!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
