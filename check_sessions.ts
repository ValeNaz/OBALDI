
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const sessions = await prisma.session.findMany({
        include: { user: true }
    });

    console.log(`Total sessions: ${sessions.length}`);
    for (const s of sessions) {
        console.log(`- TokenHash: ${s.tokenHash.substring(0, 10)}...`);
        console.log(`  User: ${s.user.email} (${s.user.role})`);
        console.log(`  Expires: ${s.expiresAt}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
