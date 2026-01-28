
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const deleted = await prisma.session.deleteMany({});
    console.log(`Deleted ${deleted.count} active sessions.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
