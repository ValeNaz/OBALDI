import { describe, expect, it, beforeAll } from "vitest";
import { renderOrderConfirmation, renderMembershipConfirmation, renderMembershipRenewal } from "@/src/core/email/templates";

describe("Email Templates", () => {
    beforeAll(() => {
        process.env.APP_BASE_URL = "http://localhost:3000";
        process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    });
    const mockDate = new Date("2025-01-01T12:00:00Z");

    it("renders order confirmation with correct totals and items", () => {
        const result = renderOrderConfirmation({
            orderId: "ORDER-123",
            totalCents: 1050,
            currency: "EUR",
            pointsSpent: 50,
            items: [
                { title: "Product A", qty: 2, unitPriceCents: 500 },
                { title: "Product B", qty: 1, unitPriceCents: 50 }
            ]
        });

        expect(result.subject).toContain("Conferma ordine Obaldi");
        expect(result.html).toContain("ORDER-123");
        expect(result.html).toContain("Product A");
        expect(result.html).toContain("EUR 10.00"); // 2 * 500
        expect(result.html).toContain("Totale: EUR 10.50");
        expect(result.html).toContain("Punti usati: 50");
    });

    it("renders membership confirmation", () => {
        const result = renderMembershipConfirmation({
            planCode: "TUTELA",
            currentPeriodEnd: mockDate
        });

        expect(result.subject).toContain("Membership Obaldi attiva");
        expect(result.html).toContain("Piano: Tutela");
        expect(result.html).toContain("2025-01-01");
    });

    it("renders membership renewal with points", () => {
        const result = renderMembershipRenewal({
            planCode: "ACCESSO",
            currentPeriodEnd: mockDate,
            pointsAwarded: 100
        });

        expect(result.subject).toContain("Rinnovo membership Obaldi");
        expect(result.html).toContain("Piano: Accesso");
        expect(result.html).toContain("Punti accreditati: 100");
    });
});
