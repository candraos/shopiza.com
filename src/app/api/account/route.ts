import { clearAuthSession } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/current-user";
import { jsonError, jsonResponse } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security/request";
import { deleteUserAccountById } from "@/lib/services/auth";

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);

    const user = await getCurrentUser();

    if (!user) {
      return jsonError("You must be logged in to delete your account.", 401);
    }

    if (user.role !== "CLIENT") {
      return jsonError("Only client accounts can be deleted here.", 403);
    }

    await deleteUserAccountById(user.id);
    await clearAuthSession();

    return jsonResponse({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(error.message, 400);
    }

    return jsonError("Could not delete your account.", 500);
  }
}
