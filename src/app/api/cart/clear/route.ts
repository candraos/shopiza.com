import { clearCart } from "@/lib/services/cart";
import { jsonError, jsonResponse } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security/request";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const { sessionId } = (await request.json()) as { sessionId?: string };

    if (!sessionId) {
      return jsonError("Cart session is required.", 400);
    }

    const cart = await clearCart(sessionId);
    return jsonResponse({ success: true, cart });
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(error.message, 400);
    }

    return jsonError("Could not clear the cart.", 500);
  }
}
