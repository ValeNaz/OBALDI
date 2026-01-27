import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";

const updateSchema = z.object({
    label: z.string().max(50).optional(),
    fullName: z.string().min(2).max(100).optional(),
    line1: z.string().min(3).max(200).optional(),
    line2: z.string().max(200).optional().nullable(),
    city: z.string().min(2).max(100).optional(),
    province: z.string().min(2).max(50).optional(),
    postalCode: z.string().min(4).max(10).optional(),
    country: z.string().length(2).optional(),
    phone: z.string().max(20).optional().nullable()
});

export async function GET(
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

    return NextResponse.json({ address });
}

export async function PUT(
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

    const existing = await prisma.address.findFirst({
        where: { id, userId: session.user.id }
    });

    if (!existing) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "Address not found." } },
            { status: 404 }
        );
    }

    const body = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: { code: "INVALID_INPUT", message: "Invalid address data." } },
            { status: 400 }
        );
    }

    const address = await prisma.address.update({
        where: { id },
        data: parsed.data
    });

    return NextResponse.json({ address });
}

export async function DELETE(
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

    const existing = await prisma.address.findFirst({
        where: { id, userId: session.user.id }
    });

    if (!existing) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "Address not found." } },
            { status: 404 }
        );
    }

    await prisma.address.delete({ where: { id } });

    // If deleted was default, set another as default
    if (existing.isDefault) {
        const another = await prisma.address.findFirst({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" }
        });
        if (another) {
            await prisma.address.update({
                where: { id: another.id },
                data: { isDefault: true }
            });
        }
    }

    return NextResponse.json({ success: true });
}
