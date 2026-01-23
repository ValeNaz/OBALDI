import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";
import { getSessionByToken, SESSION_COOKIE_NAME } from "./session";

export class AuthError extends Error {
  status: number;
  code: string;

  constructor(code: string, message: string, status = 401) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export const requireSession = async () => {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    throw new AuthError("UNAUTHORIZED", "Session missing.", 401);
  }

  const session = await getSessionByToken(token);
  if (!session) {
    throw new AuthError("UNAUTHORIZED", "Session invalid or expired.", 401);
  }

  if (session.user.isDisabled) {
    throw new AuthError("USER_DISABLED", "User disabled.", 403);
  }

  return session;
};

export const requireRole = (role: UserRole, allowed: UserRole[]) => {
  if (!allowed.includes(role)) {
    throw new AuthError("FORBIDDEN", "Insufficient permissions.", 403);
  }
};
