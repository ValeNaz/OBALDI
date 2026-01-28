import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Attempting to fetch a product with variants...");
    try {
        const products = await prisma.product.findMany({
            take: 1,
            include: {
                variants: true
            }
        });
        console.log("Success! Found", products.length, "products.");
    } catch (error: any) {
        console.error("Prisma Error:", error.message);
        if (error.message.includes("Unknown field")) {
            console.log("CRITICAL: The generated client STILL doesn't have the variants field.");
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
