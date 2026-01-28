import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    requireRole(session.user.role, ["SELLER"]);

    const product = await prisma.product.findUnique({ where: { id: params.id } });

    if (!product || product.sellerId !== session.user.id) {
      return NextResponse.json({ error: { message: "Access denied" } }, { status: 403 });
    }

    // Change status to PENDING
    await prisma.product.update({
      where: { id: params.id },
      data: { status: "PENDING" }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: "product.submitted_for_review",
        entity: "product",
        entityId: params.id,
        metadataJson: {}
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
  }
}
