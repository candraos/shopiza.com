import { getCurrentUser } from "@/lib/auth/current-user";
import { updateOrderStatus } from "@/lib/services/orders";
import { jsonError, jsonResponse } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security/request";
import { orderStatusSchema } from "@/lib/validation";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);

    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);
    if (user.role !== "ADMIN") return jsonError("Admin access required.", 403);

    const payload = orderStatusSchema.safeParse(await request.json());
    if (!payload.success) {
      return jsonResponse({ success: false, errors: payload.error.flatten().fieldErrors }, { status: 400 });
    }

    const { id } = await params;
    const order = await updateOrderStatus(id, payload.data.status);
    return jsonResponse({ success: true, order });
  } catch (error) {
    if (error instanceof Error) return jsonError(error.message, 400);
    return jsonError("Could not update the order status.", 500);
  }
}
