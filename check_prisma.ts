import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Checking Product model fields...");
    // @ts-ignore - we want to see if this throws or what it returns
    const dmmf = (prisma as any)._dmmf;
    const productModel = dmmf?.modelMap?.Product;
    if (!productModel) {
        console.log("Product model not found in DMMF!");
    } else {
        console.log("Fields in Product model:", productModel.fields.map((f: any) => f.name).join(", "));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
