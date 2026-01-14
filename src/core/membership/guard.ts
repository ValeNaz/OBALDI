import { prisma } from "@/src/core/db";
import { AuthError } from "@/src/core/auth/guard";

export const requireActiveMembership = async (userId: string) => {
  const membership = await prisma.membership.findUnique({
    where: { userId },
    include: { plan: true }
  });

  if (!membership) {
    throw new AuthError("MEMBERSHIP_REQUIRED", "Active membership required.", 403);
  }

  const now = new Date();
  if (membership.status !== "ACTIVE" || membership.currentPeriodEnd <= now) {
    throw new AuthError("MEMBERSHIP_INACTIVE", "Membership inactive.", 403);
  }

  return membership;
};
