import type { MembershipPlan } from "@prisma/client";

export const calculateRenewalPoints = (plan: MembershipPlan) => {
  if (plan.pointsPolicyType === "NONE") {
    return 0;
  }

  if (plan.pointsPolicyType === "FIXED_PER_RENEWAL") {
    return plan.pointsFixedAmount ?? 0;
  }

  const conversionRate =
    typeof plan.pointsConversionRate === "object" &&
    "toNumber" in plan.pointsConversionRate
      ? plan.pointsConversionRate.toNumber()
      : Number(plan.pointsConversionRate ?? 0);

  if (!conversionRate || conversionRate <= 0) {
    return 0;
  }

  const priceEuros = plan.priceCents / 100;
  return Math.floor(priceEuros * conversionRate);
};
