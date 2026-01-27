import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";

const addressSchema = z.object({
    label: z.string().max(50).optional(),
    fullName: z.string().min(2).max(100),
    line1: z.string().min(3).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    province: z.string().min(2).max(50),
    postalCode: z.string().min(4).max(10),
    country: z.string().length(2).default("IT"),
    phone: z.string().max(20).optional(),
    isDefault: z.boolean().optional()
});

export async function GET() {
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

    const addresses = await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
    });

    return NextResponse.json({ addresses });
}

export async function POST(request: Request) {
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

    const body = await request.json().catch(() => null);
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: { code: "INVALID_INPUT", message: "Invalid address data.", details: parsed.error.flatten() } },
            { status: 400 }
        );
    }

    const { isDefault, ...addressData } = parsed.data;

    // If this is the default address, unset other defaults
    if (isDefault) {
        await prisma.address.updateMany({
            where: { userId: session.user.id, isDefault: true },
            data: { isDefault: false }
        });
    }

    // Check if user has no addresses yet - make this one default
    const existingCount = await prisma.address.count({
        where: { userId: session.user.id }
    });

    const address = await prisma.address.create({
        data: {
            ...addressData,
            userId: session.user.id,
            isDefault: isDefault || existingCount === 0
        }
    });

    return NextResponse.json({ address }, { status: 201 });
}
