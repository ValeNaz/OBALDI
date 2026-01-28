
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const email = "seller@test.local";
    const user = await prisma.user.findUnique({
        where: { email },
        include: { sessions: true }
    });

    if (!user) {
        console.log(`User ${email} not found.`);
    } else {
        console.log(`User ${email} found:`);
        console.log(`- ID: ${user.id}`);
        console.log(`- Role: ${user.role}`);
        console.log(`- Active Sessions: ${user.sessions.length}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
