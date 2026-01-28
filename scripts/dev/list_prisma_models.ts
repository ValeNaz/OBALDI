import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("Available models in Prisma Client:");
Object.keys(prisma).forEach(key => {
    if (!key.startsWith("$") && !key.startsWith("_")) {
        console.log("-", key);
    }
});
