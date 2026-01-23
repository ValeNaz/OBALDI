import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import { enforceSameOrigin } from "@/src/core/security/csrf";

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().min(3).optional(),
  excerpt: z.string().max(400).optional().nullable(),
  body: z.string().min(20).optional(),
  tags: z.array(z.string().min(1)).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional()
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "Invalid request payload." } },
      { status: 400 }
    );
  }

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

  const post = await prisma.contentPost.findUnique({
    where: { id: params.id }
  });

  if (!post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "News not found." } },
      { status: 404 }
    );
  }

  const slug = parsed.data.slug
    ? parsed.data.slug.trim()
    : parsed.data.title
    ? slugify(parsed.data.title)
    : undefined;

  const status = parsed.data.status ?? post.status;
  const publishedAt =
    status === "PUBLISHED" && !post.publishedAt ? new Date() : post.publishedAt;

  const updated = await prisma.contentPost.update({
    where: { id: params.id },
    data: {
      title: parsed.data.title?.trim(),
      slug: slug ? slug : undefined,
      excerpt:
        parsed.data.excerpt !== undefined
          ? parsed.data.excerpt?.trim() || null
          : undefined,
      body: parsed.data.body?.trim(),
      tags: parsed.data.tags,
      status,
      publishedAt
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "content.post.updated",
      entity: "content_post",
      entityId: updated.id,
      metadataJson: {
        status: updated.status
      }
    }
  });

  return NextResponse.json({ post: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;

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

  const post = await prisma.contentPost.findUnique({
    where: { id: params.id }
  });

  if (!post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "News not found." } },
      { status: 404 }
    );
  }

  await prisma.contentPost.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "content.post.deleted",
      entity: "content_post",
      entityId: post.id,
      metadataJson: { slug: post.slug }
    }
  });

  return NextResponse.json({ ok: true });
}
