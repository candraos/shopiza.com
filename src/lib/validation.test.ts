import { describe, expect, it } from "vitest";

import {
  discountSchema,
  passwordResetConfirmSchema,
  registrationSchema,
} from "@/lib/validation";

describe("validation schemas", () => {
  it("rejects weak registration passwords", () => {
    const result = registrationSchema.safeParse({
      fullName: "Test User",
      username: "test_user",
      email: "test@example.com",
      phoneNumber: "+9613111222",
      password: "weak",
      confirmPassword: "weak",
      locationAccessGranted: false,
      locationLabel: "",
      locationLatitude: null,
      locationLongitude: null,
    });

    expect(result.success).toBe(false);
  });

  it("rejects password reset when confirmation does not match", () => {
    const result = passwordResetConfirmSchema.safeParse({
      identifier: "test@example.com",
      channel: "EMAIL",
      code: "123456",
      newPassword: "NewStrong1",
      confirmNewPassword: "Different1",
    });

    expect(result.success).toBe(false);
  });

  it("transforms a fixed amount discount into cents", () => {
    const result = discountSchema.parse({
      productId: crypto.randomUUID(),
      type: "FIXED_AMOUNT",
      value: 25,
      priceCents: 10000,
      startAt: "2026-05-13T10:00",
      endAt: "2026-05-14T10:00",
      isActive: true,
    });

    expect(result.discountValue).toBe(2500);
    expect(result.discountedPriceCents).toBe(7500);
  });
});
