import "server-only";

import { randomUUID } from "node:crypto";
import { readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  ALLOWED_PRODUCT_IMAGE_TYPES,
  MAX_PRODUCT_IMAGE_BYTES,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";

const extensionByMimeType: Record<(typeof ALLOWED_PRODUCT_IMAGE_TYPES)[number], string> =
  {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
const contentTypeByExtension = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
} as const;
const productImageFilenamePattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpe?g|png|webp)$/i;
const productImageUrlPrefix = "/uploads/products/";
const legacyProductUploadsDirectory = path.join(
  process.cwd(),
  "public",
  "uploads",
  "products",
);
const runtimeProductUploadsDirectory = resolveProductUploadsDirectory();

type ProductImageContentType =
  (typeof contentTypeByExtension)[keyof typeof contentTypeByExtension];

function resolveProductUploadsDirectory() {
  if (process.env.PRODUCT_UPLOADS_DIR) {
    return path.resolve(process.cwd(), process.env.PRODUCT_UPLOADS_DIR);
  }

  if (process.env.NODE_ENV === "production") {
    return path.join(tmpdir(), "shopizaj", "uploads", "products");
  }

  return legacyProductUploadsDirectory;
}

function getProductImageContentType(filename: string): ProductImageContentType | null {
  const extension = path.extname(filename).toLowerCase();

  return contentTypeByExtension[extension as keyof typeof contentTypeByExtension] ?? null;
}

function isMissingFileError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

function getCandidateProductUploadDirectories() {
  if (runtimeProductUploadsDirectory === legacyProductUploadsDirectory) {
    return [runtimeProductUploadsDirectory];
  }

  return [runtimeProductUploadsDirectory, legacyProductUploadsDirectory];
}

function buildProductImageUrl(filename: string) {
  return `${productImageUrlPrefix}${filename}`;
}

function getProductImageFilenameFromUrl(imageUrl: string) {
  if (!imageUrl.startsWith(productImageUrlPrefix)) {
    return null;
  }

  const filename = imageUrl.slice(productImageUrlPrefix.length);
  return productImageFilenamePattern.test(filename) ? filename : null;
}

export async function readStoredProductImage(filename: string) {
  if (!productImageFilenamePattern.test(filename)) {
    return null;
  }

  const contentType = getProductImageContentType(filename);
  if (!contentType) {
    return null;
  }

  const imageUrl = buildProductImageUrl(filename);
  const uploadedImage = await prisma.uploadedProductImage.findUnique({
    where: {
      imageUrl,
    },
    select: {
      contentType: true,
      data: true,
    },
  });

  if (uploadedImage) {
    return {
      buffer: Buffer.from(uploadedImage.data),
      contentType,
    };
  }

  for (const directory of getCandidateProductUploadDirectories()) {
    try {
      const buffer = await readFile(path.join(directory, filename));
      return { buffer, contentType };
    } catch (error) {
      if (isMissingFileError(error)) {
        continue;
      }

      throw error;
    }
  }

  return null;
}

export async function saveProductImage(file: File, uploadedByUserId: string) {
  if (!ALLOWED_PRODUCT_IMAGE_TYPES.includes(file.type as never)) {
    throw new Error("Unsupported file type. Please upload JPG, PNG, or WebP.");
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error("Image size exceeds the 4MB limit.");
  }

  const extension = extensionByMimeType[file.type as keyof typeof extensionByMimeType];
  const filename = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const imageUrl = buildProductImageUrl(filename);

  await prisma.uploadedProductImage.create({
    data: {
      uploadedByUserId,
      imageUrl,
      contentType: file.type,
      data: buffer,
    },
  });

  return imageUrl;
}

export async function deleteStoredProductImage(imageUrl: string) {
  const filename = getProductImageFilenameFromUrl(imageUrl);

  if (!filename) {
    return;
  }

  await prisma.uploadedProductImage.deleteMany({
    where: {
      imageUrl,
    },
  });

  for (const directory of getCandidateProductUploadDirectories()) {
    try {
      await unlink(path.join(directory, filename));
      return;
    } catch (error) {
      if (isMissingFileError(error)) {
        continue;
      }

      throw error;
    }
  }
}
