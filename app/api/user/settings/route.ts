import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        let settings = await prisma.userSettings.findUnique({
            where: { userId: auth.user.id },
        });

        // Create default settings if not exists
        if (!settings) {
            settings = await prisma.userSettings.create({
                data: { userId: auth.user.id },
            });
        }

        return NextResponse.json({ settings });
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { notifyOrders, notifyPromotions, notifyNewsletter, darkMode, language } = body;

        const settings = await prisma.userSettings.upsert({
            where: { userId: auth.user.id },
            update: {
                ...(notifyOrders !== undefined && { notifyOrders }),
                ...(notifyPromotions !== undefined && { notifyPromotions }),
                ...(notifyNewsletter !== undefined && { notifyNewsletter }),
                ...(darkMode !== undefined && { darkMode }),
                ...(language !== undefined && { language }),
            },
            create: {
                userId: auth.user.id,
                notifyOrders: notifyOrders ?? true,
                notifyPromotions: notifyPromotions ?? true,
                notifyNewsletter: notifyNewsletter ?? false,
                darkMode: darkMode ?? false,
                language: language ?? "it",
            },
        });

        return NextResponse.json({ settings });
    } catch (error) {
        console.error("Failed to update settings:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
