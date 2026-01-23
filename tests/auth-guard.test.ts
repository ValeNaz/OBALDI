import { describe, expect, it } from "vitest";
import { UserRole } from "@prisma/client";
import { AuthError, requireRole } from "@/src/core/auth/guard";

describe("requireRole", () => {
  it("allows when role is permitted", () => {
    expect(() =>
      requireRole(UserRole.ADMIN, [UserRole.ADMIN, UserRole.SELLER])
    ).not.toThrow();
  });

  it("throws AuthError when role is not permitted", () => {
    try {
      requireRole(UserRole.MEMBER, [UserRole.ADMIN]);
      throw new Error("Expected requireRole to throw.");
    } catch (error) {
      expect(error).toBeInstanceOf(AuthError);
      const authError = error as AuthError;
      expect(authError.code).toBe("FORBIDDEN");
      expect(authError.status).toBe(403);
    }
  });
});
