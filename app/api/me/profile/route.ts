import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionByToken, SESSION_COOKIE_NAME } from "@/src/core/auth/session";
import { prisma } from "@/src/core/db";

export async function PATCH(request: Request) {
    const token = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
        return NextResponse.json(
            { error: { code: "UNAUTHORIZED", message: "Session missing." } },
            { status: 401 }
        );
    }

    const session = await getSessionByToken(token);
    if (!session) {
        return NextResponse.json(
            { error: { code: "UNAUTHORIZED", message: "Session invalid or expired." } },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const { firstName, lastName, phone, bio } = body;

        // Email is NOT editable as per user request
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                firstName: firstName !== undefined ? firstName : undefined,
                lastName: lastName !== undefined ? lastName : undefined,
                phone: phone !== undefined ? phone : undefined,
                bio: bio !== undefined ? bio : undefined,
            } as any,
        });

        return NextResponse.json({
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
                firstName: (updatedUser as any).firstName,
                lastName: (updatedUser as any).lastName,
                phone: (updatedUser as any).phone,
                bio: (updatedUser as any).bio,
            }
        });
    } catch (error: any) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { error: { message: "Impossibile aggiornare il profilo." } },
            { status: 500 }
        );
    }
}
