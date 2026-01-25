import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import {
  extractStoragePath,
  getStorageBucket,
  getSupabaseAdmin
} from "@/src/core/storage/supabase";
import { enforceSameOrigin } from "@/src/core/security/csrf";
import { unlink } from "fs/promises";
import { existsSync } from "fs";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const csrf = enforceSameOrigin(request);
    if (csrf) return csrf;

    const session = await requireSession();
    requireRole(session.user.role, ["ADMIN"]);

    const media = await prisma.productMedia.findUnique({
      where: { id: params.id }
    });

    if (!media) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Immagine non trovata nel database." } },
        { status: 404 }
      );
    }

    const isLocal = media.url.startsWith("/uploads/");
    let storagePath = media.storagePath;

    // Only attempt to parse Supabase path if it's not local and storagePath is missing
    if (!isLocal && !storagePath) {
      try {
        storagePath = extractStoragePath(media.url);
      } catch (e) {
        console.warn("Could not extract storage path (Supabase might not be configured):", e);
      }
    }

    if (isLocal && storagePath) {
      try {
        if (existsSync(storagePath)) {
          await unlink(storagePath);
        }
      } catch (err) {
        console.error("Local file delete error:", err);
        // Continue to delete from DB even if file cleanup fails to avoid orphans in DB
      }
    } else if (storagePath) {
      const bucket = getStorageBucket();
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.storage.from(bucket).remove([storagePath]);
      if (error) {
        console.error("Supabase delete error:", error);
        return NextResponse.json(
          { error: { code: "DELETE_FAILED", message: "Errore durante la rimozione dall'archiviazione remota." } },
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
          storagePath: storagePath
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Media DELETE error:", error);
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: { message: error.message || "Errore interno durante l'eliminazione." } },
      { status: 500 }
    );
  }
}

