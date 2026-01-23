import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim();

  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      ...(query
        ? {
            title: {
              startsWith: query,
              mode: "insensitive"
            }
          }
        : {})
    },
    orderBy: { createdAt: "desc" },
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
