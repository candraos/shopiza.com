import { describe, expect, it } from "vitest";

import {
  discountSchema,
  passwordResetConfirmSchema,
  productSchema,
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
    });

    expect(result.success).toBe(false);
  });

  it("rejects password reset when confirmation does not match", () => {
    const result = passwordResetConfirmSchema.safeParse({
      email: "test@example.com",
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
      startImmediately: false,
      isActive: true,
    });

    expect(result.discountValue).toBe(2500);
    expect(result.discountedPriceCents).toBe(7500);
  });

  it("uses the current server time when a discount starts immediately", () => {
    const before = Date.now();
    const result = discountSchema.parse({
      productId: crypto.randomUUID(),
      type: "PERCENTAGE",
      value: 20,
      priceCents: 10000,
      startAt: "",
      endAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      startImmediately: true,
      isActive: true,
    });
    const after = Date.now();

    expect(result.startAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.startAt.getTime()).toBeLessThanOrEqual(after);
  });

  it("requires a start time when the discount does not start immediately", () => {
    const result = discountSchema.safeParse({
      productId: crypto.randomUUID(),
      type: "PERCENTAGE",
      value: 20,
      priceCents: 10000,
      startAt: "",
      endAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      startImmediately: false,
      isActive: true,
    });

    expect(result.success).toBe(false);
  });

  it("accepts decimal prices for products", () => {
    const result = productSchema.parse({
      name: "Test Product",
      description: "A product description that is definitely long enough.",
      price: "1499.99",
      stock: 3,
      sectionId: "",
      images: [
        {
          imageUrl: "/media/products/test-product/1",
          altText: "",
          isMain: true,
          sortOrder: 0,
        },
      ],
    });

    expect(result.priceCents).toBe(149999);
    expect(result.archived).toBe(false);
  });

  it("rejects zero or negative product price", () => {
    const result = productSchema.safeParse({
      name: "Test Product",
      description: "A product description that is definitely long enough.",
      price: "0",
      stock: 3,
      sectionId: "",
      images: [
        {
          imageUrl: "/media/products/test-product/1",
          altText: "",
          isMain: true,
          sortOrder: 0,
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects decimal stock values for products", () => {
    const result = productSchema.safeParse({
      name: "Test Product",
      description: "A product description that is definitely long enough.",
      price: "1499.99",
      stock: 3.5,
      sectionId: "",
      images: [
        {
          imageUrl: "/media/products/test-product/1",
          altText: "",
          isMain: true,
          sortOrder: 0,
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects zero stock for products", () => {
    const result = productSchema.safeParse({
      name: "Test Product",
      description: "A product description that is definitely long enough.",
      price: "1499.99",
      stock: 0,
      sectionId: "",
      images: [
        {
          imageUrl: "/media/products/test-product/1",
          altText: "",
          isMain: true,
          sortOrder: 0,
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects products without an explicitly selected main image", () => {
    const result = productSchema.safeParse({
      name: "Test Product",
      description: "A product description that is definitely long enough.",
      price: "1499.99",
      stock: 3,
      sectionId: "",
      images: [
        {
          imageUrl: "/media/products/test-product/1",
          altText: "",
          isMain: false,
          sortOrder: 0,
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});
