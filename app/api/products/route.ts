import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category")?.trim();
  const minPrice = url.searchParams.get("minPrice") ? parseInt(url.searchParams.get("minPrice")!) : null;
  const maxPrice = url.searchParams.get("maxPrice") ? parseInt(url.searchParams.get("maxPrice")!) : null;
  const sort = url.searchParams.get("sort") || "date-desc";

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { priceCents: "asc" };
  else if (sort === "price-desc") orderBy = { priceCents: "desc" };
  else if (sort === "date-asc") orderBy = { createdAt: "asc" };

  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      ...(query
        ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } }
          ]
        }
        : {}),
      ...(category && category !== "ALL" ? { category: category as any } : {}),
      ...(minPrice !== null || maxPrice !== null ? {
        priceCents: {
          ...(minPrice !== null ? { gte: minPrice } : {}),
          ...(maxPrice !== null ? { lte: maxPrice } : {})
        }
      } : {})
    },
    orderBy,
    include: {
      media: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          url: true,
          type: true,
          sortOrder: true
        }
      }
    }
  });

  return NextResponse.json({ products });
}
