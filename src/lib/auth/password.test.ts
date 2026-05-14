import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("hashes and verifies valid passwords", async () => {
    const hash = await hashPassword("ShopizaStrong1");
    await expect(verifyPassword("ShopizaStrong1", hash)).resolves.toBe(true);
    await expect(verifyPassword("WrongPassword1", hash)).resolves.toBe(false);
  });
});
