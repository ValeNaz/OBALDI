import { NextResponse } from "next/server";
import { AuthError, requireSession } from "@/src/core/auth/guard";
import { getBillingDetails } from "@/src/core/membership/billing";

export async function GET() {
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

    try {
        const billingDetails = await getBillingDetails(session.user.id);

        if (!billingDetails) {
            return NextResponse.json(
                { error: { code: "NO_MEMBERSHIP", message: "Nessun abbonamento attivo." } },
                { status: 404 }
            );
        }

        return NextResponse.json(billingDetails);
    } catch (error) {
        console.error("Failed to get billing details:", error);
        return NextResponse.json(
            { error: { code: "BILLING_ERROR", message: "Impossibile recuperare i dettagli di fatturazione." } },
            { status: 500 }
        );
    }
}
