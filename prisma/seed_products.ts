import { PrismaClient, ProductStatus, ProductCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding realistic products...");

    // Get an admin or seller user
    const user = await prisma.user.findFirst({
        where: { role: "ADMIN" }
    });

    if (!user) {
        console.error("No admin user found. Run development setup first.");
        return;
    }

    const sellerId = user.id;

    const items = [
        {
            title: "Obaldi Vision Pro",
            description: "Visore a realtà aumentata ad alte prestazioni con lenti cristalline e tracking oculare avanzato.",
            priceCents: 129900,
            category: ProductCategory.ELECTRONICS,
            isFeatured: true,
            adminTag: "HERO",
            media: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80"
        },
        {
            title: "Smart Home Hub v3",
            description: "Il centro di comando per la tua casa intelligente. Compatibile con oltre 5000 dispositivi.",
            priceCents: 14900,
            category: ProductCategory.HOME,
            isFeatured: true,
            adminTag: "DA_NON_PERDERE",
            media: "https://images.unsplash.com/photo-1558002038-103792e17730?w=800&q=80"
        },
        {
            title: "Zaino Ergonoms",
            description: "Zaino da viaggio ultra-leggero con scomparto per laptop imbottito e materiali resistenti all'acqua.",
            priceCents: 8500,
            category: ProductCategory.FASHION,
            isFeatured: false,
            adminTag: "COLLEZIONE_A",
            media: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"
        },
        {
            title: "Drone SkyFocus 4K",
            description: "Drone pieghevole con camera 4K stabilizzata e 30 minuti di autonomia di volo.",
            priceCents: 49900,
            category: ProductCategory.ELECTRONICS,
            isFeatured: true,
            adminTag: "COLLEZIONE_A",
            media: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800&q=80"
        },
        {
            title: "Macchina Caffè Obaldi",
            description: "Espresso perfetto in pochi secondi grazie alla pressione a 19 bar e design minimalista.",
            priceCents: 19900,
            category: ProductCategory.HOME,
            isFeatured: false,
            adminTag: "COLLEZIONE_B",
            media: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80"
        },
        {
            title: "Set Yoga Premium",
            description: "Tappetino antiscivolo ed ecologico con blocchi e cinghia inclusi per la tua pratica quotidiana.",
            priceCents: 4500,
            category: ProductCategory.SPORTS,
            isFeatured: false,
            adminTag: "COLLEZIONE_B",
            media: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80"
        },
        {
            title: "Siero Viso Advanced",
            description: "Formula rigenerante con acido ialuronico e vitamina C per una pelle luminosa e giovane.",
            priceCents: 3900,
            category: ProductCategory.BEAUTY,
            isFeatured: true,
            adminTag: "DA_NON_PERDERE",
            media: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80"
        }
    ];

    for (const item of items) {
        const product = await prisma.product.create({
            data: {
                sellerId,
                title: item.title,
                description: item.description,
                priceCents: item.priceCents,
                category: item.category,
                status: ProductStatus.APPROVED,
                isFeatured: item.isFeatured,
                adminTag: item.adminTag,
                specsJson: {},
                media: {
                    create: {
                        url: item.media,
                        type: "IMAGE",
                        sortOrder: 1
                    }
                }
            }
        });
        console.log(`Created product: ${product.title}`);
    }

    console.log("Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
