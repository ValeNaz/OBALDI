import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Force re-instantiation in development to pick up new schema models if missing
if (process.env.NODE_ENV !== "production" && globalForPrisma.prisma && !(globalForPrisma.prisma as any).conversation) {
  delete globalForPrisma.prisma;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
