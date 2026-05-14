import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import {
  ALLOWED_PRODUCT_IMAGE_TYPES,
  MAX_PRODUCT_IMAGE_BYTES,
} from "@/lib/constants";

const extensionByMimeType: Record<(typeof ALLOWED_PRODUCT_IMAGE_TYPES)[number], string> =
  {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };

export async function saveProductImage(file: File) {
  if (!ALLOWED_PRODUCT_IMAGE_TYPES.includes(file.type as never)) {
    throw new Error("Unsupported file type. Please upload JPG, PNG, or WebP.");
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error("Image size exceeds the 4MB limit.");
  }

  const directory = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(directory, { recursive: true });

  const extension = extensionByMimeType[file.type as keyof typeof extensionByMimeType];
  const filename = `${randomUUID()}${extension}`;
  const filepath = path.join(directory, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filepath, buffer);

  return `/uploads/products/${filename}`;
}
