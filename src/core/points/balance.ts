import { prisma } from "@/src/core/db";

export const getPointsBalance = async (userId: string) => {
  const [ledger, reserved] = await prisma.$transaction([
    prisma.pointsLedger.aggregate({
      where: { userId },
      _sum: { delta: true }
    }),
    prisma.order.aggregate({
      where: {
        userId,
        status: "CREATED",
        paidWith: "MIXED",
        pointsSpent: { gt: 0 }
      },
      _sum: { pointsSpent: true }
    })
  ]);

  const ledgerPoints = ledger._sum.delta ?? 0;
  const reservedPoints = reserved._sum.pointsSpent ?? 0;
  return ledgerPoints - reservedPoints;
};
