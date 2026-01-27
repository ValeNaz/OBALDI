import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    let session;
    try {
        session = await requireSession();
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json(
                { error: { code: error.code, message: error.message } },
                { status: error.status }
            );
        }
        throw error;
    }

    const address = await prisma.address.findFirst({
        where: { id, userId: session.user.id }
    });

    if (!address) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "Address not found." } },
            { status: 404 }
        );
    }

    // Unset all other defaults
    await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false }
    });

    // Set this one as default
    const updated = await prisma.address.update({
        where: { id },
        data: { isDefault: true }
    });

    return NextResponse.json({ address: updated });
}
