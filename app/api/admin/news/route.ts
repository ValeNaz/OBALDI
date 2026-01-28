import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import { enforceSameOrigin } from "@/src/core/security/csrf";
import { getClientIp, rateLimit } from "@/src/core/security/rate-limit";

const createSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).optional(),
  excerpt: z.string().max(400).optional(),
  body: z.string().min(20),
  tags: z.array(z.string().min(1)).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT")
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limiter = rateLimit({
    key: `admin:news:list:${ip}`,
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

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const where = status === "DRAFT" || status === "PUBLISHED" ? { status: status as "DRAFT" | "PUBLISHED" } : {};

  const posts = await prisma.contentPost.findMany({
    where,
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limiter = rateLimit({
    key: `admin:news:create:${ip}`,
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

  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);

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

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.title);
  if (!slug) {
    return NextResponse.json(
      { error: { code: "INVALID_SLUG", message: "Slug non valido." } },
      { status: 400 }
    );
  }

  const publishedAt = parsed.data.status === "PUBLISHED" ? new Date() : null;

  try {
    const post = await prisma.contentPost.create({
      data: {
        type: "NEWS",
        title: parsed.data.title.trim(),
        slug,
        excerpt: parsed.data.excerpt?.trim() || null,
        body: parsed.data.body.trim(),
        tags: parsed.data.tags,
        status: parsed.data.status,
        publishedAt
      }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: "content.post.created",
        entity: "content_post",
        entityId: post.id,
        metadataJson: { status: post.status }
      }
    });

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json(
      { error: { code: "CREATE_FAILED", message: "Impossibile creare la news." } },
      { status: 500 }
    );
  }
}
