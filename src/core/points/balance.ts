import { prisma } from "@/src/core/db";

export const getPointsBalance = async (userId: string) => {
  const result = await prisma.pointsLedger.aggregate({
    where: { userId },
    _sum: { delta: true }
  });

  return result._sum.delta ?? 0;
};
