import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";
import { AuthError, requireRole, requireSession } from "@/src/core/auth/guard";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await requireSession();
        requireRole(session.user.role, ["ADMIN"]);
        const conversationId = params.id;
        const { status, title } = await req.json();

        const data: any = {};
        if (status) data.status = status;
        if (title) data.title = title;

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
        }

        const conversation = await (prisma.conversation as any).update({
            where: { id: conversationId },
            data
        });

        return NextResponse.json({ conversation });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("PATCH conversation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
