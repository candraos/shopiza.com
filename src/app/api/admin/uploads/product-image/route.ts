import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createUploadedProductImages,
  deleteUploadedProductImage,
} from "@/lib/services/admin";
import { jsonError, jsonResponse } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security/request";
import { deleteStoredProductImage, saveProductImage } from "@/lib/uploads";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const user = await getCurrentUser();
    if (!user) {
      return jsonError("Authentication required.", 401);
    }

    if (user.role !== "ADMIN") {
      return jsonError("Admin access required.", 403);
    }

    const formData = await request.formData();
    const uploaded = formData.getAll("files").filter((value): value is File => value instanceof File);

    if (uploaded.length === 0) {
      return jsonError("Upload at least one image.", 400);
    }

    const imageUrls = await Promise.all(uploaded.map((file) => saveProductImage(file)));

    let images;
    try {
      images = await createUploadedProductImages({
        uploadedByUserId: user.id,
        imageUrls,
      });
    } catch (error) {
      await Promise.allSettled(imageUrls.map((imageUrl) => deleteStoredProductImage(imageUrl)));
      throw error;
    }

    return jsonResponse({
      success: true,
      images: images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
      })),
    });
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(error.message, 400);
    }

    return jsonError("Could not upload the image.", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);

    const user = await getCurrentUser();
    if (!user) {
      return jsonError("Authentication required.", 401);
    }

    if (user.role !== "ADMIN") {
      return jsonError("Admin access required.", 403);
    }

    const payload = (await request.json()) as { id?: string; imageUrl?: string };

    if (!payload.id || !payload.imageUrl) {
      return jsonError("Image id and image URL are required.", 400);
    }

    const result = await deleteUploadedProductImage({
      id: payload.id,
      uploadedByUserId: user.id,
    });

    if (result.count === 0) {
      return jsonError("Uploaded image not found.", 404);
    }

    await deleteStoredProductImage(payload.imageUrl);

    return jsonResponse({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(error.message, 400);
    }

    return jsonError("Could not remove the uploaded image.", 500);
  }
}
