import { getCurrentUser } from "@/lib/auth/current-user";
import { jsonError, jsonResponse } from "@/lib/http";
import { getAdminUnseenOrderCount } from "@/lib/services/orders";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);
    if (user.role !== "ADMIN") return jsonError("Admin access required.", 403);

    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since");

    if (!since) {
      return jsonResponse({ success: true, count: 0 });
    }

    const sinceDate = new Date(since);
    if (Number.isNaN(sinceDate.getTime())) {
      return jsonError("Invalid since value.", 400);
    }

    const count = await getAdminUnseenOrderCount(sinceDate);
    return jsonResponse({ success: true, count });
  } catch (error) {
    if (error instanceof Error) return jsonError(error.message, 400);
    return jsonError("Could not load the unseen order count.", 500);
  }
}
