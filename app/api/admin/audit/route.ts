import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

const parseLimit = (value: string | null) => {
  const parsed = value ? Number(value) : 50;
  if (!Number.isFinite(parsed) || parsed <= 0) return 50;
  return Math.min(parsed, 200);
};

export async function GET(request: Request) {
  let session;
  try {
    session = await requireSession();
    requireRole(session.user.role, ["ADMIN"]);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    throw error;
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim();
  const limit = parseLimit(url.searchParams.get("limit"));

  const where = query
    ? {
      OR: [
        { action: { contains: query, mode: "insensitive" as const } },
        { entity: { contains: query, mode: "insensitive" as const } }
      ]
    }
    : undefined;

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actorUser: {
        select: {
          id: true,
          email: true
        }
      }
    }
  });

  return NextResponse.json({
    logs: logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      createdAt: log.createdAt,
      actorUser: log.actorUser,
      metadataJson: log.metadataJson
    }))
  });
}
