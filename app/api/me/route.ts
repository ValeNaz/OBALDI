import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionByToken, SESSION_COOKIE_NAME } from "@/src/core/auth/session";
import { getPointsBalance } from "@/src/core/points/balance";

export async function GET() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Session missing." } },
      { status: 401 }
    );
  }

  const session = await getSessionByToken(token) as any;
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Session invalid or expired." } },
      { status: 401 }
    );
  }

  const { user } = session;
  const membership = user.membership
    ? {
      status: user.membership.status,
      planCode: user.membership.plan.code,
      currentPeriodEnd: user.membership.currentPeriodEnd,
      autoRenew: user.membership.autoRenew
    }
    : null;

  const pointsBalance = await getPointsBalance(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      bio: user.bio,
      avatarUrl: user.avatarUrl
    },
    membership,
    pointsBalance
  });
}
