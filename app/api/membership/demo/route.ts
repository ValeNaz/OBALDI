import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { hashPassword } from "@/src/core/auth/passwords";

/**
 * DEMO ONLY - Create membership without payment
 * This should be disabled in production!
 */

const schema = z.object({
    email: z.string().email(),
    planCode: z.enum(["ACCESSO", "TUTELA"]).default("TUTELA"),
    password: z.string().min(6).optional()
});

export async function POST(request: Request) {
    // Check if we're in development
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { error: { code: "DISABLED", message: "Demo mode disabled in production." } },
            { status: 403 }
        );
    }

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: { code: "INVALID_INPUT", message: "Email non valida." } },
            { status: 400 }
        );
    }

    const { email, planCode, password } = parsed.data;

    try {
        // Get the plan
        const plan = await prisma.membershipPlan.findUnique({
            where: { code: planCode }
        });

        if (!plan) {
            return NextResponse.json(
                { error: { code: "PLAN_NOT_FOUND", message: "Piano non trovato." } },
                { status: 404 }
            );
        }

        // Create or update user
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                emailVerifiedAt: new Date(),
                firstName: "Demo",
                lastName: "User",
                ...(password && { passwordHash: await hashPassword(password) })
            },
            create: {
                email,
                role: "MEMBER",
                emailVerifiedAt: new Date(),
                firstName: "Demo",
                lastName: "User",
                ...(password && { passwordHash: await hashPassword(password) })
            }
        });

        // Calculate period
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setDate(periodEnd.getDate() + plan.periodDays);

        // Create membership
        const membership = await prisma.membership.upsert({
            where: { userId: user.id },
            update: {
                planId: plan.id,
                status: "ACTIVE",
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                autoRenew: true,
                provider: "STRIPE",
                providerSubId: `demo_${user.id}_${Date.now()}`
            },
            create: {
                userId: user.id,
                planId: plan.id,
                status: "ACTIVE",
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                autoRenew: true,
                provider: "STRIPE",
                providerSubId: `demo_${user.id}_${Date.now()}`
            }
        });

        // Award points if premium plan
        if (plan.code === "TUTELA") {
            const pointsAmount = plan.pointsFixedAmount ?? 10;
            await prisma.pointsLedger.create({
                data: {
                    userId: user.id,
                    delta: pointsAmount,
                    reason: "RENEWAL",
                    refType: "MEMBERSHIP",
                    refId: membership.id
                }
            });
        }

        // Create user settings with optimal defaults
        await prisma.userSettings.upsert({
            where: { userId: user.id },
            update: {
                notifyOrders: true,
                notifyPromotions: true,
                notifyNewsletter: true,
                darkMode: false,
                language: "it"
            },
            create: {
                userId: user.id,
                notifyOrders: true,
                notifyPromotions: true,
                notifyNewsletter: true,
                darkMode: false,
                language: "it"
            }
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            },
            membership: {
                id: membership.id,
                plan: plan.code,
                status: membership.status,
                expiresAt: membership.currentPeriodEnd
            },
            message: `Account creato! Puoi accedere con email: ${email}${password ? ' e la password impostata' : '. Imposta una password dalla pagina profilo.'}`
        });
    } catch (error) {
        console.error("Demo account creation failed:", error);
        return NextResponse.json(
            { error: { code: "CREATE_ERROR", message: "Errore nella creazione account." } },
            { status: 500 }
        );
    }
}

