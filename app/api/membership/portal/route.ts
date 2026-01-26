import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";
import { enforceSameOrigin } from "@/src/core/security/csrf";
import {
    getCustomerIdFromSubscription,
    createBillingPortalSession
} from "@/src/core/membership/billing";
import { getAppBaseUrl } from "@/src/core/config";

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
        const customerId = await getCustomerIdFromSubscription(membership.providerSubId);
        const returnUrl = `${getAppBaseUrl()}/billing`;

        const portalSession = await createBillingPortalSession(customerId, returnUrl);

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error("Failed to create portal session:", error);
        return NextResponse.json(
            { error: { code: "PORTAL_ERROR", message: "Impossibile aprire il portale di fatturazione." } },
            { status: 500 }
        );
    }
}
