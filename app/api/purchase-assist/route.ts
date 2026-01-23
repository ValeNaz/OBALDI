import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/core/db";
import { AuthError, requireSession } from "@/src/core/auth/guard";
import { requireActiveMembership } from "@/src/core/membership/guard";
import { enforceSameOrigin } from "@/src/core/security/csrf";
import { notifyAdmins } from "@/src/core/email/notifications";

const schema = z.object({
  urlToCheck: z.string().url(),
  notes: z.string().max(1000).optional()
});

export async function GET() {
  let session;
  try {
    session = await requireSession();
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    throw error;
  }

  const requests = await prisma.purchaseAssistRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ requests });
}

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
  let membership;
  try {
    session = await requireSession();
    membership = await requireActiveMembership(session.user.id);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    throw error;
  }

  if (membership.plan.code !== "TUTELA") {
    return NextResponse.json(
      { error: { code: "PREMIUM_ONLY", message: "Premium membership required." } },
      { status: 403 }
    );
  }

  const requestRecord = await prisma.purchaseAssistRequest.create({
    data: {
      userId: session.user.id,
      urlToCheck: parsed.data.urlToCheck,
      notes: parsed.data.notes?.trim() || null,
      status: "OPEN"
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      action: "purchase_assist.created",
      entity: "purchaseAssist",
      entityId: requestRecord.id,
      metadataJson: {
        urlToCheck: requestRecord.urlToCheck
      }
    }
  });

  await notifyAdmins({
    subject: "Nuova richiesta assistenza acquisto",
    html: `
      <p>Nuova richiesta di assistenza acquisto.</p>
      <p>Utente: ${session.user.email}</p>
      <p>URL: ${requestRecord.urlToCheck}</p>
    `,
    text: `Nuova richiesta assistenza acquisto. Utente: ${session.user.email}. URL: ${requestRecord.urlToCheck}`
  });

  return NextResponse.json({ request: requestRecord });
}
