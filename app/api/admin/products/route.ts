import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "PENDING";

  try {
    const session = await requireSession();
    requireRole(session.user.role, ["ADMIN"]);

    const whereClause: any = {};
    if (status !== "ALL") {
      whereClause.status = status as "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: { media: true }
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Admin Products GET Error:", error);
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: { message: error.message || "Failed to fetch products" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requireRole(session.user.role, ["ADMIN"]);

    const body = await request.json();

    // Basic validation
    if (!body.title || !body.priceCents) {
      return NextResponse.json({ error: { message: "Title and price are required" } }, { status: 400 });
    }

    const productData: any = {
      sellerId: session.user.id,
      title: body.title,
      description: body.description ?? "",
      specsJson: body.specsJson ?? {},
      priceCents: body.priceCents,
      currency: body.currency ?? "EUR",
      status: "APPROVED",
      premiumOnly: body.premiumOnly ?? false,
      pointsEligible: body.pointsEligible ?? false,
      pointsPrice: body.pointsEligible ? body.pointsPrice : null,
      category: body.category || "OTHER",
      isFeatured: body.isFeatured ?? false,
      isHero: body.isHero ?? false,
      isPromo: body.isPromo ?? false,
      isSplit: body.isSplit ?? false,
      isCarousel: body.isCarousel ?? false,
      isCollection: body.isCollection ?? false,
      adminTag: body.adminTag
    };

    const product = await prisma.product.create({
      data: productData
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: "product.created",
        entity: "product",
        entityId: product.id,
        metadataJson: { source: "admin_dashboard" }
      }
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("Admin Products POST Error:", error);
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: { message: error.message || "Failed to create product" } },
      { status: 500 }
    );
  }
}
