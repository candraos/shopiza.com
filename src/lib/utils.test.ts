import { describe, expect, it } from "vitest";

import {
  calculateDiscountedPriceCents,
  normalizePhoneNumber,
  sanitizeText,
} from "@/lib/utils";

describe("utils", () => {
  it("calculates percentage discounts safely", () => {
    expect(calculateDiscountedPriceCents(10000, "PERCENTAGE", 20)).toBe(8000);
  });

  it("calculates fixed discounts without going negative", () => {
    expect(calculateDiscountedPriceCents(1500, "FIXED_AMOUNT", 5000)).toBe(0);
  });

  it("normalizes phone numbers", () => {
    expect(normalizePhoneNumber("+961 3 118 776")).toBe("+9613118776");
  });

  it("removes control characters from text input", () => {
    expect(sanitizeText("Hello\u0000 Shopiza")).toBe("Hello Shopiza");
  });
});
