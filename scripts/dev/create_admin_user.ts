
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./src/core/auth/passwords";

const prisma = new PrismaClient();

async function main() {
    const email = "admin@obaldi.com";
    const password = "admin";
    const hashedPassword = await hashPassword(password);

    console.log(`Creating/Updating admin user: ${email}`);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            role: "ADMIN"
        },
        create: {
            email,
            passwordHash: hashedPassword,
            firstName: "Admin",
            lastName: "User",
            role: "ADMIN",
        }
    });

    console.log("Admin user ready:", user.id);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
