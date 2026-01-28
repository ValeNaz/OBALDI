
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Testing orders query...");
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                user: {
                    select: { id: true, email: true }
                },
                items: {
                    include: {
                        product: {
                            select: { id: true, title: true }
                        },
                        variant: {
                            select: { title: true }
                        }
                    }
                }
            }
        });
        console.log("Query successful. Found orders:", orders.length);
        if (orders.length > 0) {
            console.log("First order items:", JSON.stringify(orders[0].items, null, 2));
        }
    } catch (error) {
        console.error("Query failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
