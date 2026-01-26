import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";
import { getInvoices, getCustomerIdFromSubscription } from "@/src/core/membership/billing";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const startingAfter = searchParams.get("starting_after") || undefined;

    // Check if this is a demo account
    if (membership.providerSubId.startsWith("demo_")) {
        // Return empty invoices for demo accounts
        return NextResponse.json({
            invoices: [],
            hasMore: false,
            isDemo: true
        });
    }

    try {
        const customerId = await getCustomerIdFromSubscription(membership.providerSubId);
        const invoicesResponse = await getInvoices(customerId, limit, startingAfter);

        const invoices = invoicesResponse.data.map((invoice) => ({
            id: invoice.id,
            number: invoice.number,
            status: invoice.status,
            amountDue: invoice.amount_due,
            amountPaid: invoice.amount_paid,
            currency: invoice.currency,
            createdAt: new Date(invoice.created * 1000).toISOString(),
            paidAt: invoice.status_transitions.paid_at
                ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
                : null,
            hostedInvoiceUrl: invoice.hosted_invoice_url,
            invoicePdf: invoice.invoice_pdf,
            description: invoice.lines.data[0]?.description || "Abbonamento Obaldi"
        }));

        return NextResponse.json({
            invoices,
            hasMore: invoicesResponse.has_more
        });
    } catch (error) {
        console.error("Failed to get invoices:", error);
        return NextResponse.json(
            { error: { code: "INVOICES_ERROR", message: "Impossibile recuperare le fatture." } },
            { status: 500 }
        );
    }
}
