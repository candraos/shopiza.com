import { getCurrentUser } from "@/lib/auth/current-user";
import { deleteSection, updateSection } from "@/lib/services/admin";
import { jsonError, jsonResponse } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security/request";
import { sectionSchema } from "@/lib/validation";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);

    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);
    if (user.role !== "ADMIN") return jsonError("Admin access required.", 403);

    const payload = sectionSchema.safeParse(await request.json());
    if (!payload.success) {
      return jsonResponse({ success: false, errors: payload.error.flatten().fieldErrors }, { status: 400 });
    }

    const { id } = await params;
    const section = await updateSection(id, payload.data);
    return jsonResponse({ success: true, section });
  } catch (error) {
    if (error instanceof Error) return jsonError(error.message, 400);
    return jsonError("Could not update the section.", 500);
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
    await deleteSection(id);
    return jsonResponse({ success: true });
  } catch (error) {
    if (error instanceof Error) return jsonError(error.message, 400);
    return jsonError("Could not delete the section.", 500);
  }
}
