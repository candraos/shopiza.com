import { getCurrentUser } from "@/lib/auth/current-user";
import { upsertDiscount } from "@/lib/services/admin";
import { jsonError, jsonResponse } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security/request";
import { discountSchema } from "@/lib/validation";

export async function POST(request: Request) {
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

    const discount = await upsertDiscount({
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
    return jsonError("Could not save the discount.", 500);
  }
}
