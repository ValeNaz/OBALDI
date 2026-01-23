import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import {
  buildPublicStorageUrl,
  getStorageBucket,
  getSupabaseAdmin
} from "@/src/core/storage/supabase";
import { enforceSameOrigin } from "@/src/core/security/csrf";

const schema = z.object({
  productId: z.string().uuid(),
  fileName: z.string().min(1).max(200),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  mediaType: z.enum(["IMAGE", "VIDEO"])
});

const allowedContentTypes = {
  IMAGE: ["image/jpeg", "image/png", "image/webp"],
  VIDEO: ["video/mp4", "video/webm"]
};

const maxSizeBytes = {
  IMAGE: 10 * 1024 * 1024,
  VIDEO: 100 * 1024 * 1024
};

const sanitizeFileName = (value: string) =>
  value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);

export async function POST(request: Request) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;

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
    where: { id: parsed.data.productId }
  });

  if (!product || product.sellerId !== session.user.id) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Product not found." } },
      { status: 404 }
    );
  }

  if (product.status !== "DRAFT" && product.status !== "PENDING") {
    return NextResponse.json(
      { error: { code: "INVALID_STATE", message: "Media locked for this product." } },
      { status: 400 }
    );
  }

  const allowedTypes = allowedContentTypes[parsed.data.mediaType];
  if (!allowedTypes.includes(parsed.data.contentType)) {
    return NextResponse.json(
      { error: { code: "INVALID_TYPE", message: "File type not allowed." } },
      { status: 400 }
    );
  }

  const maxSize = maxSizeBytes[parsed.data.mediaType];
  if (parsed.data.sizeBytes > maxSize) {
    return NextResponse.json(
      { error: { code: "FILE_TOO_LARGE", message: "File is too large." } },
      { status: 400 }
    );
  }

  const safeName = sanitizeFileName(parsed.data.fileName);
  const objectPath = `products/${product.id}/${crypto.randomUUID()}-${safeName}`;

  const supabase = getSupabaseAdmin();
  const bucket = getStorageBucket();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(objectPath);

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: { code: "UPLOAD_URL_ERROR", message: "Unable to create upload URL." } },
      { status: 500 }
    );
  }

  const lastMedia = await prisma.productMedia.aggregate({
    where: { productId: product.id },
    _max: { sortOrder: true }
  });

  const sortOrder = (lastMedia._max.sortOrder ?? 0) + 1;
  const media = await prisma.productMedia.create({
    data: {
      productId: product.id,
      type: parsed.data.mediaType,
      url: buildPublicStorageUrl(objectPath),
      storagePath: objectPath,
      sortOrder
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "product.media.created",
      entity: "productMedia",
      entityId: media.id,
      metadataJson: {
        productId: product.id,
        mediaType: parsed.data.mediaType
      }
    }
  });

  return NextResponse.json({ uploadUrl: data.signedUrl, media });
}
