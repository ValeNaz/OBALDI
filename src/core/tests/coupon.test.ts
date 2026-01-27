import { describe, it, expect } from "vitest";

// Mock Coupon Type from Prisma
enum CouponType {
    PERCENTAGE = "PERCENTAGE",
    FIXED_AMOUNT = "FIXED_AMOUNT"
}

type Coupon = {
    code: string;
    type: CouponType;
    value: number;
    minOrderCents: number | null;
    maxDiscountCents: number | null;
    validFrom: Date | null;
    validUntil: Date | null;
    isActive: boolean;
    maxUses: number | null;
    usedCount: number;
};

// Logic to test (extracted from route/controller usually, but duplicating here for pure logic test)
const validateCouponLogic = (coupon: Coupon, orderTotalCents: number, userId: string) => {
    if (!coupon.isActive) return { valid: false, reason: "Inactive" };

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) return { valid: false, reason: "Not started" };
    if (coupon.validUntil && now > coupon.validUntil) return { valid: false, reason: "Expired" };

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { valid: false, reason: "Usage limit reached" };

    if (coupon.minOrderCents && orderTotalCents < coupon.minOrderCents) {
        return { valid: false, reason: `Minimum order ${coupon.minOrderCents / 100}€` };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === "FIXED_AMOUNT") {
        discount = coupon.value;
    } else {
        discount = Math.round((orderTotalCents * coupon.value) / 100);
    }

    // Cap discount
    if (coupon.maxDiscountCents && discount > coupon.maxDiscountCents) {
        discount = coupon.maxDiscountCents;
    }

    // Ensure discount doesn't exceed total (mostly relevant for fixed amounts)
    if (discount > orderTotalCents) {
        discount = orderTotalCents;
    }

    return { valid: true, discount };
};

describe("Coupon Validation Logic", () => {
    const baseCoupon: Coupon = {
        code: "TEST10",
        type: CouponType.PERCENTAGE,
        value: 10, // 10%
        minOrderCents: null,
        maxDiscountCents: null,
        validFrom: null,
        validUntil: null,
        isActive: true,
        maxUses: null,
        usedCount: 0
    };

    it("should calculate percentage discount correctly", () => {
        const result = validateCouponLogic(baseCoupon, 10000, "user1"); // 100€
        expect(result.valid).toBe(true);
        expect(result.discount).toBe(1000); // 10€
    });

    it("should calculate fixed amount discount correctly", () => {
        const fixedCoupon = { ...baseCoupon, type: CouponType.FIXED_AMOUNT, value: 500 }; // 5€
        const result = validateCouponLogic(fixedCoupon, 2000, "user1"); // 20€
        expect(result.valid).toBe(true);
        expect(result.discount).toBe(500);
    });

    it("should fail if inactive", () => {
        const inactiveCoupon = { ...baseCoupon, isActive: false };
        const result = validateCouponLogic(inactiveCoupon, 1000, "user1");
        expect(result.valid).toBe(false);
        expect(result.reason).toBe("Inactive");
    });

    it("should fail if expired", () => {
        const expiredCoupon = { ...baseCoupon, validUntil: new Date("2020-01-01") };
        const result = validateCouponLogic(expiredCoupon, 1000, "user1");
        expect(result.valid).toBe(false);
        expect(result.reason).toBe("Expired");
    });

    it("should enforce minimum order amount", () => {
        const minOrderCoupon = { ...baseCoupon, minOrderCents: 5000 }; // 50€
        const result = validateCouponLogic(minOrderCoupon, 2000, "user1"); // 20€
        expect(result.valid).toBe(false);
        expect(result.reason).toContain("Minimum order");
    });

    it("should cap discount at maxDiscountCents", () => {
        const cappedCoupon = {
            ...baseCoupon,
            value: 50, // 50%
            maxDiscountCents: 2000 // Max 20€
        };
        const result = validateCouponLogic(cappedCoupon, 10000, "user1"); // 100€ -> 50€ discount > 20€ cap
        expect(result.valid).toBe(true);
        expect(result.discount).toBe(2000);
    });
});
