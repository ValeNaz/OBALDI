import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import { getClientIp, rateLimit } from "@/src/core/security/rate-limit";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "PENDING";

  const ip = getClientIp(request);
  const limiter = rateLimit({
    key: `admin:products:list:${ip}`,
    limit: 60,
    windowMs: 60 * 1000
  });

  if (!limiter.allowed) {
    const retryAfter = Math.ceil((limiter.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests." } },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

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

    const ip = getClientIp(request);
    const limiter = rateLimit({
      key: `admin:products:create:${ip}`,
      limit: 20,
      windowMs: 60 * 1000
    });

    if (!limiter.allowed) {
      const retryAfter = Math.ceil((limiter.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Too many requests." } },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

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
