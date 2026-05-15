import { getCurrentUser } from "@/lib/auth/current-user";
import { deleteDiscount, upsertDiscount } from "@/lib/services/admin";
import { jsonError, jsonResponse } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security/request";
import { discountSchema } from "@/lib/validation";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);

    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);
    if (user.role !== "ADMIN") return jsonError("Admin access required.", 403);

    const payload = discountSchema.safeParse(await request.json());
    if (!payload.success) {
      const errors = payload.error.flatten().fieldErrors;
      const message =
        Object.values(errors).flat()[0] ?? "Please correct the discount details.";

      return jsonResponse({ success: false, message, errors }, { status: 400 });
    }

    const { id } = await params;
    const discount = await upsertDiscount({
      id,
      productId: payload.data.productId,
      type: payload.data.type,
      value: payload.data.discountValue,
      startAt: payload.data.startAt,
      endAt: payload.data.endAt,
      isActive: payload.data.isActive,
    });

    return jsonResponse({ success: true, discount });
  } catch (error) {
    if (error instanceof Error) return jsonError(error.message, 400);
    return jsonError("Could not update the discount.", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);

    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);
    if (user.role !== "ADMIN") return jsonError("Admin access required.", 403);

    const { id } = await params;
    await deleteDiscount(id);
    return jsonResponse({ success: true });
  } catch (error) {
    if (error instanceof Error) return jsonError(error.message, 400);
    return jsonError("Could not delete the discount.", 500);
  }
}
