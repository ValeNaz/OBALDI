import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";
import { InventoryReason } from "@prisma/client";

const movementSchema = z.object({
    delta: z.number().int(),
    reason: z.enum(["RESTOCK", "ADJUSTMENT", "RETURN"]),
    note: z.string().max(500).optional()
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

    // Admin only
    if (session.user.role !== "ADMIN") {
        return NextResponse.json(
            { error: { code: "FORBIDDEN", message: "Admin access required." } },
            { status: 403 }
        );
    }

    const product = await prisma.product.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            stockQty: true,
            lowStockAlert: true,
            trackInventory: true,
            isOutOfStock: true
        }
    });

    if (!product) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "Product not found." } },
            { status: 404 }
        );
    }

    const movements = await prisma.inventoryMovement.findMany({
        where: { productId: id },
        orderBy: { createdAt: "desc" },
        take: 50
    });

    return NextResponse.json({
        product,
        movements
    });
}

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

    // Admin only
    if (session.user.role !== "ADMIN") {
        return NextResponse.json(
            { error: { code: "FORBIDDEN", message: "Admin access required." } },
            { status: 403 }
        );
    }

    const body = await request.json().catch(() => null);
    const parsed = movementSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: { code: "INVALID_INPUT", message: "Invalid inventory data." } },
            { status: 400 }
        );
    }

    const product = await prisma.product.findUnique({
        where: { id },
        select: { stockQty: true, trackInventory: true }
    });

    if (!product) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "Product not found." } },
            { status: 404 }
        );
    }

    const newQty = product.stockQty + parsed.data.delta;

    if (newQty < 0) {
        return NextResponse.json(
            { error: { code: "INVALID_QUANTITY", message: "Stock cannot be negative." } },
            { status: 400 }
        );
    }

    // Update in transaction
    const [movement, updatedProduct] = await prisma.$transaction([
        prisma.inventoryMovement.create({
            data: {
                productId: id,
                delta: parsed.data.delta,
                reason: parsed.data.reason as InventoryReason,
                note: parsed.data.note
            }
        }),
        prisma.product.update({
            where: { id },
            data: {
                stockQty: newQty,
                isOutOfStock: newQty === 0
            }
        })
    ]);

    return NextResponse.json({
        movement,
        stockQty: updatedProduct.stockQty,
        isOutOfStock: updatedProduct.isOutOfStock
    }, { status: 201 });
}
