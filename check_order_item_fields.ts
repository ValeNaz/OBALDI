import { prisma } from "./src/core/db";

async function checkFields() {
    console.log("Checking OrderItem fields...");
    // @ts-ignore
    const dmmf = (prisma as any)._dmmf;
    const orderItemModel = dmmf.datamodel.models.find((m: any) => m.name === "OrderItem");
    if (orderItemModel) {
        console.log("Fields in OrderItem:");
        orderItemModel.fields.forEach((f: any) => {
            console.log("-", f.name);
        });
    } else {
        console.log("OrderItem model not found in DMMF");
    }
}

checkFields().finally(() => prisma.$disconnect());
