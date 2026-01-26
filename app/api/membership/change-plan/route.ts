import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";
import { enforceSameOrigin } from "@/src/core/security/csrf";
import { updateSubscriptionPlan } from "@/src/core/membership/billing";
import { createNotification } from "@/lib/notifications";

const schema = z.object({
    planCode: z.enum(["ACCESSO", "TUTELA"])
});

export async function POST(request: Request) {
    const csrf = enforceSameOrigin(request);
    if (csrf) return csrf;

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
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: { code: "INVALID_INPUT", message: "Piano non valido." } },
            { status: 400 }
        );
    }

    const membership = await prisma.membership.findUnique({
        where: { userId: session.user.id },
        include: { plan: true }
    });

    if (!membership) {
        return NextResponse.json(
            { error: { code: "NO_MEMBERSHIP", message: "Nessun abbonamento attivo." } },
            { status: 404 }
        );
    }

    if (membership.plan.code === parsed.data.planCode) {
        return NextResponse.json(
            { error: { code: "SAME_PLAN", message: "Sei già su questo piano." } },
            { status: 400 }
        );
    }

    const newPlan = await prisma.membershipPlan.findUnique({
        where: { code: parsed.data.planCode }
    });

    if (!newPlan || !newPlan.isActive) {
        return NextResponse.json(
            { error: { code: "PLAN_NOT_FOUND", message: "Piano non disponibile." } },
            { status: 404 }
        );
    }

    const oldPlanCode = membership.plan.code;
    const isUpgrade = newPlan.priceCents > membership.plan.priceCents;

    try {
        const subscription = await updateSubscriptionPlan(
            membership.providerSubId,
            parsed.data.planCode
        );

        // Update local membership
        await prisma.membership.update({
            where: { id: membership.id },
            data: {
                planId: newPlan.id,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000)
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                actorUserId: session.user.id,
                action: isUpgrade ? "membership.upgraded" : "membership.downgraded",
                entity: "membership",
                entityId: membership.id,
                metadataJson: {
                    oldPlan: oldPlanCode,
                    newPlan: parsed.data.planCode,
                    isUpgrade
                }
            }
        });

        // Send notification
        await createNotification({
            userId: session.user.id,
            type: "MEMBERSHIP_RENEWED",
            title: isUpgrade ? "Piano aggiornato!" : "Piano modificato",
            message: isUpgrade
                ? `Hai effettuato l'upgrade al piano ${parsed.data.planCode}. Goditi i nuovi vantaggi!`
                : `Sei passato al piano ${parsed.data.planCode}. La modifica è attiva da subito.`,
            link: "/billing"
        });

        return NextResponse.json({
            success: true,
            oldPlan: oldPlanCode,
            newPlan: parsed.data.planCode,
            isUpgrade,
            effectiveDate: new Date().toISOString()
        });
    } catch (error) {
        console.error("Failed to change plan:", error);
        return NextResponse.json(
            { error: { code: "CHANGE_ERROR", message: "Impossibile cambiare piano." } },
            { status: 500 }
        );
    }
}
