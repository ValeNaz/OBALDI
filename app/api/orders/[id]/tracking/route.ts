import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";

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

    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            userId: session.user.id
        },
        include: {
            shipment: true,
            shippingAddress: true,
            items: {
                include: {
                    product: {
                        select: { title: true }
                    }
                }
            }
        }
    });

    if (!order) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "Order not found." } },
            { status: 404 }
        );
    }

    return NextResponse.json({
        order: {
            id: order.id,
            status: order.status,
            totalCents: order.totalCents,
            currency: order.currency,
            createdAt: order.createdAt,
            items: order.items.map(item => ({
                productTitle: item.product.title,
                qty: item.qty,
                unitPriceCents: item.unitPriceCents
            }))
        },
        shipment: order.shipment ? {
            status: order.shipment.status,
            carrier: order.shipment.carrier,
            trackingCode: order.shipment.trackingCode,
            trackingUrl: order.shipment.trackingUrl,
            estimatedAt: order.shipment.estimatedAt,
            shippedAt: order.shipment.shippedAt,
            deliveredAt: order.shipment.deliveredAt
        } : null,
        shippingAddress: order.shippingAddress ? {
            fullName: order.shippingAddress.fullName,
            line1: order.shippingAddress.line1,
            line2: order.shippingAddress.line2,
            city: order.shippingAddress.city,
            province: order.shippingAddress.province,
            postalCode: order.shippingAddress.postalCode,
            country: order.shippingAddress.country
        } : null
    });
}
