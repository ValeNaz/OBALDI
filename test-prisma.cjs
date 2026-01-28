const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Prisma models:', Object.keys(prisma).filter(k => k[0] !== '_'));
    try {
        const count = await prisma.conversation.count();
        console.log('Conversation count:', count);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
