import { Provider } from "@prisma/client";
import { prisma } from "@/src/core/db";
import { calculateRenewalPoints } from "@/src/core/membership/points";

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

    const plan = await tx.membershipPlan.findUnique({
      where: { id: params.planId }
    });

    if (plan) {
      const pointsAwarded = calculateRenewalPoints(plan);
      if (pointsAwarded > 0) {
        await tx.pointsLedger.create({
          data: {
            userId: user.id,
            delta: pointsAwarded,
            reason: "RENEWAL",
            refType: "MEMBERSHIP",
            refId: membership.id
          }
        });
      }
    }

    await tx.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "membership.created",
        entity: "membership",
        entityId: membership.id,
        metadataJson: {
          provider: params.provider,
          providerSubId: params.providerSubId,
          planId: params.planId
        }
      }
    });

    return { userId: user.id, membershipId: membership.id };
  });
};
