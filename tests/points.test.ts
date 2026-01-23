import { describe, expect, it } from "vitest";
import { Prisma, type MembershipPlan } from "@prisma/client";
import { calculateRenewalPoints } from "@/src/core/membership/points";

const makePlan = (overrides: Partial<MembershipPlan>): MembershipPlan => ({
  id: "plan-1",
  code: "ACCESSO",
  priceCents: 1000,
  currency: "EUR",
  periodDays: 28,
  pointsPolicyType: "NONE",
  pointsFixedAmount: null,
  pointsConversionRate: null,
  isActive: true,
  ...overrides,
});

describe("calculateRenewalPoints", () => {
  it("returns 0 for NONE policy", () => {
    const plan = makePlan({ pointsPolicyType: "NONE" });
    expect(calculateRenewalPoints(plan)).toBe(0);
  });

  it("returns fixed amount for FIXED_PER_RENEWAL", () => {
    const plan = makePlan({
      pointsPolicyType: "FIXED_PER_RENEWAL",
      pointsFixedAmount: 120,
    });
    expect(calculateRenewalPoints(plan)).toBe(120);
  });

  it("converts fee to points and floors the result", () => {
    const plan = makePlan({
      pointsPolicyType: "CONVERT_FEE_TO_POINTS",
      priceCents: 999,
      pointsConversionRate: new Prisma.Decimal("1.5"),
    });
    expect(calculateRenewalPoints(plan)).toBe(14);
  });

  it("returns 0 when conversion rate is invalid", () => {
    const plan = makePlan({
      pointsPolicyType: "CONVERT_FEE_TO_POINTS",
      pointsConversionRate: 0,
    });
    expect(calculateRenewalPoints(plan)).toBe(0);
  });
});
