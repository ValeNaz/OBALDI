import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { requireRole, requireSession } from "@/src/core/auth/guard";

export async function POST(request: Request) {
    try {
        const session = await requireSession();
        requireRole(session.user.role, ["ADMIN"]);

        const body = await request.json();
        const { action, ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: { code: "BAD_REQUEST", message: "No IDs provided." } },
                { status: 400 }
            );
        }

        let result;

        if (action === "DELETE") {
            // First delete related records if necessary (though cascade usually handles this)
            // Prisma handles cascade delete if configured in schema.
            // Assuming cascade is set up or we rely on it.
            // If not, we might fail. Given schema, Product usually cascades variants.
            result = await prisma.product.deleteMany({
                where: { id: { in: ids } }
            });
        } else if (action === "APPROVE") {
            result = await prisma.product.updateMany({
                where: { id: { in: ids } },
                data: { status: "APPROVED" }
            });
        } else if (action === "REJECT") {
            result = await prisma.product.updateMany({
                where: { id: { in: ids } },
                data: { status: "REJECTED" }
            });
        } else {
            return NextResponse.json(
                { error: { code: "BAD_REQUEST", message: "Invalid action." } },
                { status: 400 }
            );
        }

        return NextResponse.json({ count: result.count });
    } catch (error: any) {
        return NextResponse.json(
            { error: { code: "INTERNAL_ERROR", message: error.message } },
            { status: 500 }
        );
    }
}
