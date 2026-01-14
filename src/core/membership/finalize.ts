import { Provider } from "@prisma/client";
import { prisma } from "@/src/core/db";

export const finalizeMembershipCheckout = async (params: {
  checkoutSessionId: string;
  email: string;
  provider: Provider;
  providerSubId: string;
  planId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}) => {
  return prisma.$transaction(async (tx) => {
    const checkout = await tx.checkoutSession.findUnique({
      where: { id: params.checkoutSessionId }
    });

    if (!checkout) {
      throw new Error("Checkout session not found.");
    }

    await tx.checkoutSession.update({
      where: { id: params.checkoutSessionId },
      data: {
        status: "PAID"
      }
    });

    const user = await tx.user.upsert({
      where: { email: params.email },
      update: { emailVerifiedAt: new Date() },
      create: {
        email: params.email,
        role: "MEMBER",
        emailVerifiedAt: new Date()
      }
    });

    const membership = await tx.membership.upsert({
      where: { userId: user.id },
      update: {
        planId: params.planId,
        status: "ACTIVE",
        currentPeriodStart: params.currentPeriodStart,
        currentPeriodEnd: params.currentPeriodEnd,
        autoRenew: true,
        provider: params.provider,
        providerSubId: params.providerSubId
      },
      create: {
        userId: user.id,
        planId: params.planId,
        status: "ACTIVE",
        currentPeriodStart: params.currentPeriodStart,
        currentPeriodEnd: params.currentPeriodEnd,
        autoRenew: true,
        provider: params.provider,
        providerSubId: params.providerSubId
      }
    });

    return { userId: user.id, membershipId: membership.id };
  });
};
