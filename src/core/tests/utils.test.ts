import { describe, it, expect } from "vitest";
import { formatCurrency, isValidEmail } from "../utils";

describe("Utils", () => {
    describe("formatCurrency", () => {
        it("should format cents to EUR correctly", () => {
            expect(formatCurrency(1000)).toContain("10,00");
            expect(formatCurrency(1000)).toContain("€");
        });

        it("should handle zero", () => {
            expect(formatCurrency(0)).toContain("0,00");
        });
    });

    describe("isValidEmail", () => {
        it("should return true for valid emails", () => {
            expect(isValidEmail("test@example.com")).toBe(true);
            expect(isValidEmail("user.name+tag@domain.co.uk")).toBe(true);
        });

        it("should return false for invalid emails", () => {
            expect(isValidEmail("plainaddress")).toBe(false);
            expect(isValidEmail("@missingusername.com")).toBe(false);
            expect(isValidEmail("username@.com")).toBe(false);
        });
    });
});
