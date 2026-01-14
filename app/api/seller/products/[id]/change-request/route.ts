import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

const schema = z.object({
  proposedDataJson: z.record(z.unknown())
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "Invalid request payload." } },
      { status: 400 }
    );
  }

  let session;
  try {
    session = await requireSession();
    requireRole(session.user.role, ["SELLER"]);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    throw error;
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id }
  });

  if (!product || product.sellerId !== session.user.id) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Product not found." } },
      { status: 404 }
    );
  }

  if (product.status !== "APPROVED") {
    return NextResponse.json(
      { error: { code: "INVALID_STATUS", message: "Change request requires approval." } },
      { status: 400 }
    );
  }

  const changeRequest = await prisma.productChangeRequest.create({
    data: {
      productId: product.id,
      sellerId: session.user.id,
      proposedDataJson: parsed.data.proposedDataJson,
      status: "PENDING"
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "product.change_request",
      entity: "product_change_request",
      entityId: changeRequest.id,
      metadataJson: { productId: product.id }
    }
  });

  return NextResponse.json({ changeRequest });
}
