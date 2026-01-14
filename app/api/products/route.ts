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
              contains: query,
              mode: "insensitive"
            }
          }
        : {})
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ products });
}
