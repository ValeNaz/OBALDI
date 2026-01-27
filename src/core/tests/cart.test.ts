import { describe, it, expect } from "vitest";

// Replicating/Importing Logic for testing (Simplified for integration test example)
// In a real scenario, this would import the actual calculation function from cart service logic
const calculateCartTotal = (items: { priceCents: number; qty: number }[], discountCents: number = 0) => {
    const subtotal = items.reduce((acc, item) => acc + item.priceCents * item.qty, 0);
    const total = Math.max(0, subtotal - discountCents);
    return { subtotal, total };
};

describe("Cart Integration Logic", () => {
    it("should calculate total correctly without discount", () => {
        const items = [
            { priceCents: 1000, qty: 2 }, // 20€
            { priceCents: 500, qty: 1 }   // 5€
        ];
        const { subtotal, total } = calculateCartTotal(items);
        expect(subtotal).toBe(2500);
        expect(total).toBe(2500);
    });

    it("should apply discount correctly", () => {
        const items = [
            { priceCents: 1000, qty: 2 } // 20€
        ];
        const { total } = calculateCartTotal(items, 500); // 5€ discount
        expect(total).toBe(1500);
    });

    it("should not drop below zero", () => {
        const items = [
            { priceCents: 1000, qty: 1 } // 10€
        ];
        const { total } = calculateCartTotal(items, 1500); // 15€ discount
        expect(total).toBe(0);
    });
});
