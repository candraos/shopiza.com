import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");

  return `scrypt:${salt}:${hash}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const incomingHash = scryptSync(password, salt, KEY_LENGTH);
  const currentHash = Buffer.from(hash, "hex");

  if (incomingHash.length !== currentHash.length) {
    return false;
  }

  return timingSafeEqual(incomingHash, currentHash);
}
