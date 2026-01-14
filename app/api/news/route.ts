import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";

export async function GET() {
  const posts = await prisma.contentPost.findMany({
    where: { status: "PUBLISHED", type: "NEWS" },
    orderBy: { publishedAt: "desc" }
  });

  return NextResponse.json({ posts });
}
