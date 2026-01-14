import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const post = await prisma.contentPost.findUnique({
    where: { slug: params.slug }
  });

  if (!post || post.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Post not found." } },
      { status: 404 }
    );
  }

  return NextResponse.json({ post });
}
