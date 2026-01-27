import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";
import { ShipmentStatus } from "@prisma/client";
import { createNotification } from "@/lib/notifications";
import {
    renderMembershipRenewal,
    renderOrderConfirmation,
    renderOrderShipped,
    renderOrderDelivered
} from "@/src/core/email/templates";
import { sendEmail } from "@/src/core/email/sender";

const createSchema = z.object({
    carrier: z.string().max(50).optional(),
    trackingCode: z.string().max(100).optional(),
    trackingUrl: z.string().url().optional(),
    estimatedAt: z.string().datetime().optional()
});

const updateSchema = z.object({
    carrier: z.string().max(50).optional(),
    trackingCode: z.string().max(100).optional(),
    trackingUrl: z.string().url().optional(),
    status: z.enum(["PENDING", "LABEL_CREATED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED"]).optional(),
    estimatedAt: z.string().datetime().optional().nullable()
});

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: orderId } = await params;

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

    if (session.user.role !== "ADMIN") {
        return NextResponse.json(
            { error: { code: "FORBIDDEN", message: "Admin access required." } },
            { status: 403 }
        );
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            shipment: true,
            user: { select: { email: true, firstName: true } }
        }
    });

    if (!order) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "Order not found." } },
            { status: 404 }
        );
    }

    return NextResponse.json({ shipment: order.shipment, order });
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: orderId } = await params;

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

    if (session.user.role !== "ADMIN") {
        return NextResponse.json(
            { error: { code: "FORBIDDEN", message: "Admin access required." } },
            { status: 403 }
        );
    }

    const body = await request.json().catch(() => null);
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: { code: "INVALID_INPUT", message: "Invalid shipment data." } },
            { status: 400 }
        );
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { shipment: true }
    });

    if (!order) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "Order not found." } },
            { status: 404 }
        );
    }

    if (order.status !== "PAID") {
        return NextResponse.json(
            { error: { code: "ORDER_NOT_PAID", message: "Can only create shipment for paid orders." } },
            { status: 400 }
        );
    }

    if (order.shipment) {
        return NextResponse.json(
            { error: { code: "SHIPMENT_EXISTS", message: "Shipment already exists. Use PATCH to update." } },
            { status: 409 }
        );
    }

    const shipment = await prisma.shipment.create({
        data: {
            orderId,
            carrier: parsed.data.carrier,
            trackingCode: parsed.data.trackingCode,
            trackingUrl: parsed.data.trackingUrl,
            estimatedAt: parsed.data.estimatedAt ? new Date(parsed.data.estimatedAt) : null,
            status: "PENDING"
        }
    });

    return NextResponse.json({ shipment }, { status: 201 });
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: orderId } = await params;

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

    if (session.user.role !== "ADMIN") {
        return NextResponse.json(
            { error: { code: "FORBIDDEN", message: "Admin access required." } },
            { status: 403 }
        );
    }

    const body = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: { code: "INVALID_INPUT", message: "Invalid shipment data." } },
            { status: 400 }
        );
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { shipment: true }
    });

    if (!order || !order.shipment) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "Shipment not found." } },
            { status: 404 }
        );
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.carrier !== undefined) updateData.carrier = parsed.data.carrier;
    if (parsed.data.trackingCode !== undefined) updateData.trackingCode = parsed.data.trackingCode;
    if (parsed.data.trackingUrl !== undefined) updateData.trackingUrl = parsed.data.trackingUrl;
    if (parsed.data.estimatedAt !== undefined) {
        updateData.estimatedAt = parsed.data.estimatedAt ? new Date(parsed.data.estimatedAt) : null;
    }

    // Handle status transitions
    if (parsed.data.status) {
        updateData.status = parsed.data.status as ShipmentStatus;

        if (parsed.data.status === "SHIPPED" && !order.shipment.shippedAt) {
            updateData.shippedAt = new Date();
        }
        if (parsed.data.status === "DELIVERED" && !order.shipment.deliveredAt) {
            updateData.deliveredAt = new Date();
        }

        // Notify user of status change
        await createNotification({
            userId: order.userId,
            type: parsed.data.status === "DELIVERED" ? "ORDER_DELIVERED" : "ORDER_SHIPPED",
            title: parsed.data.status === "DELIVERED" ? "Ordine consegnato!" : "Ordine spedito",
            message: parsed.data.status === "DELIVERED"
                ? "Il tuo ordine è stato consegnato con successo."
                : `Il tuo ordine è stato spedito${order.shipment.carrier ? ` con ${order.shipment.carrier}` : ""}.`,
            link: `/orders/${orderId}`
        });

        // Send Email
        try {
            if (parsed.data.status === "SHIPPED") {
                const emailContent = renderOrderShipped({
                    orderId: order.id,
                    carrier: parsed.data.carrier ?? order.shipment.carrier,
                    trackingCode: parsed.data.trackingCode ?? order.shipment.trackingCode,
                    trackingUrl: parsed.data.trackingUrl ?? order.shipment.trackingUrl,
                    shippedAt: new Date()
                });
                if (order.user?.email) {
                    await sendEmail({ to: order.user.email, ...emailContent });
                }
            } else if (parsed.data.status === "DELIVERED") {
                const emailContent = renderOrderDelivered({
                    orderId: order.id,
                    deliveredAt: new Date()
                });
                if (order.user?.email) {
                    await sendEmail({ to: order.user.email, ...emailContent });
                }
            }
        } catch (e) {
            console.error("Failed to send shipment email", e);
        }
    }

    const shipment = await prisma.shipment.update({
        where: { id: order.shipment.id },
        data: updateData
    });

    return NextResponse.json({ shipment });
}
