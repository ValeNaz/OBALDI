
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true, email: true, firstName: true, lastName: true }
    });
    console.log("Found admins:", JSON.stringify(admins, null, 2));
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
