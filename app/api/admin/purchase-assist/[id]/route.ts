import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";
import { sendEmail } from "@/src/core/email/sender";
import { enforceSameOrigin } from "@/src/core/security/csrf";

const schema = z.object({
  status: z.enum(["OPEN", "IN_REVIEW", "DONE"]).optional(),
  outcome: z.string().max(2000).optional().nullable()
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body ?? {});

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

  const requestRecord = await prisma.purchaseAssistRequest.findUnique({
    where: { id: params.id }
  });

  if (!requestRecord) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Request not found." } },
      { status: 404 }
    );
  }

  const updated = await prisma.purchaseAssistRequest.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status ?? requestRecord.status,
      outcome:
        parsed.data.outcome !== undefined ? parsed.data.outcome : requestRecord.outcome
    },
    include: {
      user: {
        select: {
          email: true
        }
      }
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "purchase_assist.updated",
      entity: "purchaseAssist",
      entityId: updated.id,
      metadataJson: {
        status: updated.status
      }
    }
  });

  let emailSent = false;
  const statusChanged = updated.status !== requestRecord.status;
  const outcomeChanged =
    parsed.data.outcome !== undefined && parsed.data.outcome !== requestRecord.outcome;

  if (statusChanged || outcomeChanged) {
    const statusLabel =
      updated.status === "OPEN"
        ? "Aperta"
        : updated.status === "IN_REVIEW"
        ? "In revisione"
        : "Completata";

    const subject = `Aggiornamento richiesta assistenza: ${statusLabel}`;
    const outcomeLine = updated.outcome
      ? `<p><strong>Esito:</strong> ${updated.outcome}</p>`
      : "";

    try {
      await sendEmail({
        to: updated.user.email,
        subject,
        html: `
          <p>Ciao,</p>
          <p>La tua richiesta di assistenza è stata aggiornata.</p>
          <p><strong>Stato:</strong> ${statusLabel}</p>
          ${outcomeLine}
          <p>Grazie,<br/>Team Obaldi</p>
        `,
        text: `La tua richiesta è stata aggiornata. Stato: ${statusLabel}. ${updated.outcome ? `Esito: ${updated.outcome}` : ""}`
      });
      emailSent = true;
    } catch {
      emailSent = false;
    }
  }

  return NextResponse.json({ request: updated, emailSent });
}
