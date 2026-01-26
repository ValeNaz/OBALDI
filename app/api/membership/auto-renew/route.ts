import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";
import { enforceSameOrigin } from "@/src/core/security/csrf";
import { toggleAutoRenew } from "@/src/core/membership/billing";

const schema = z.object({
    enabled: z.boolean()
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
            { error: { code: "INVALID_INPUT", message: "Input non valido." } },
            { status: 400 }
        );
    }

    const membership = await prisma.membership.findUnique({
        where: { userId: session.user.id }
    });

    if (!membership) {
        return NextResponse.json(
            { error: { code: "NO_MEMBERSHIP", message: "Nessun abbonamento attivo." } },
            { status: 404 }
        );
    }

    try {
        await toggleAutoRenew(membership.providerSubId, parsed.data.enabled);

        await prisma.membership.update({
            where: { id: membership.id },
            data: { autoRenew: parsed.data.enabled }
        });

        await prisma.auditLog.create({
            data: {
                actorUserId: session.user.id,
                action: parsed.data.enabled ? "membership.autorenew_enabled" : "membership.autorenew_disabled",
                entity: "membership",
                entityId: membership.id,
                metadataJson: { autoRenew: parsed.data.enabled }
            }
        });

        return NextResponse.json({
            success: true,
            autoRenew: parsed.data.enabled
        });
    } catch (error) {
        console.error("Failed to toggle auto-renew:", error);
        return NextResponse.json(
            { error: { code: "TOGGLE_ERROR", message: "Impossibile modificare il rinnovo automatico." } },
            { status: 500 }
        );
    }
}
