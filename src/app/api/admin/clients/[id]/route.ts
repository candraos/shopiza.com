import { requireAdmin } from "@/lib/auth/current-user";
import { jsonError, jsonResponse } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security/request";
import { deleteClientAccountById } from "@/lib/services/admin";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    await requireAdmin();

    const { id } = await context.params;
    await deleteClientAccountById(id);

    return jsonResponse({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(error.message, 400);
    }

    return jsonError("Could not delete the client account.", 500);
  }
}
