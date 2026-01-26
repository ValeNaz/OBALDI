import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";
import { enforceSameOrigin } from "@/src/core/security/csrf";
import { cancelSubscription, resumeSubscription } from "@/src/core/membership/billing";
import { createNotification } from "@/lib/notifications";

const schema = z.object({
    immediate: z.boolean().optional().default(false)
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

    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: { code: "INVALID_INPUT", message: "Input non valido." } },
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

    try {
        const subscription = await cancelSubscription(
            membership.providerSubId,
            !parsed.data.immediate
        );

        // Update local membership status
        await prisma.membership.update({
            where: { id: membership.id },
            data: {
                autoRenew: false,
                ...(parsed.data.immediate && { status: "CANCELED" })
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                actorUserId: session.user.id,
                action: parsed.data.immediate ? "membership.canceled" : "membership.cancel_scheduled",
                entity: "membership",
                entityId: membership.id,
                metadataJson: {
                    immediate: parsed.data.immediate,
                    cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null
                }
            }
        });

        // Send notification
        await createNotification({
            userId: session.user.id,
            type: "SYSTEM",
            title: parsed.data.immediate
                ? "Abbonamento cancellato"
                : "Cancellazione programmata",
            message: parsed.data.immediate
                ? "Il tuo abbonamento è stato cancellato immediatamente."
                : `Il tuo abbonamento sarà attivo fino al ${membership.currentPeriodEnd.toLocaleDateString("it-IT")}.`,
            link: "/billing"
        });

        return NextResponse.json({
            success: true,
            immediate: parsed.data.immediate,
            cancelAt: subscription.cancel_at
                ? new Date(subscription.cancel_at * 1000).toISOString()
                : membership.currentPeriodEnd.toISOString()
        });
    } catch (error) {
        console.error("Failed to cancel subscription:", error);
        return NextResponse.json(
            { error: { code: "CANCEL_ERROR", message: "Impossibile cancellare l'abbonamento." } },
            { status: 500 }
        );
    }
}

// DELETE to resume a scheduled cancellation
export async function DELETE(request: Request) {
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

    const membership = await prisma.membership.findUnique({
        where: { userId: session.user.id }
    });

    if (!membership) {
        return NextResponse.json(
            { error: { code: "NO_MEMBERSHIP", message: "Nessun abbonamento." } },
            { status: 404 }
        );
    }

    try {
        await resumeSubscription(membership.providerSubId);

        await prisma.membership.update({
            where: { id: membership.id },
            data: { autoRenew: true }
        });

        await prisma.auditLog.create({
            data: {
                actorUserId: session.user.id,
                action: "membership.cancel_reverted",
                entity: "membership",
                entityId: membership.id,
                metadataJson: {}
            }
        });

        await createNotification({
            userId: session.user.id,
            type: "SYSTEM",
            title: "Cancellazione annullata",
            message: "Il tuo abbonamento continuerà a rinnovarsi automaticamente.",
            link: "/billing"
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to resume subscription:", error);
        return NextResponse.json(
            { error: { code: "RESUME_ERROR", message: "Impossibile ripristinare l'abbonamento." } },
            { status: 500 }
        );
    }
}
