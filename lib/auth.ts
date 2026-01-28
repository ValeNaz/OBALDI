import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { prisma } from "@/src/core/db";
import { SESSION_COOKIE_NAME, getSessionByToken } from "@/src/core/auth/session";

type AuthResult = {
    user: {
        id: string;
        email: string;
        role: "MEMBER" | "SELLER" | "ADMIN";
    } | null;
};

export async function verifyAuth(req: NextRequest): Promise<AuthResult> {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

        if (!token) {
            return { user: null };
        }

        const session = await getSessionByToken(token);

        if (!session || session.user.isDisabled) {
            return { user: null };
        }

        return {
            user: {
                id: session.user.id,
                email: session.user.email,
                role: session.user.role as "MEMBER" | "SELLER" | "ADMIN",
            },
        };
    } catch (error) {
        console.error("Auth verification error:", error);
        return { user: null };
    }
}

export { requireSession, requireRole, AuthError } from "@/src/core/auth/guard";
