import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import {
  extractStoragePath,
  getStorageBucket,
  getSupabaseAdmin
} from "@/src/core/storage/supabase";
import { enforceSameOrigin } from "@/src/core/security/csrf";

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

  const media = await prisma.productMedia.findUnique({
    where: { id: params.id }
  });

  if (!media) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Media not found." } },
      { status: 404 }
    );
  }

  const bucket = getStorageBucket();
  const supabase = getSupabaseAdmin();
  const path = media.storagePath ?? extractStoragePath(media.url);

  if (path) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      return NextResponse.json(
        { error: { code: "DELETE_FAILED", message: "Unable to delete media." } },
        { status: 500 }
      );
    }
  }

  await prisma.productMedia.delete({ where: { id: media.id } });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "product.media.deleted",
      entity: "productMedia",
      entityId: media.id,
      metadataJson: {
        productId: media.productId,
        storagePath: path
      }
    }
  });

  return NextResponse.json({ ok: true });
}
