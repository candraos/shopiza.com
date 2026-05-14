import { getCurrentUser } from "@/lib/auth/current-user";
import { createSection } from "@/lib/services/admin";
import { jsonError, jsonResponse } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security/request";
import { sectionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);
    if (user.role !== "ADMIN") return jsonError("Admin access required.", 403);

    const payload = sectionSchema.safeParse(await request.json());
    if (!payload.success) {
      return jsonResponse({ success: false, errors: payload.error.flatten().fieldErrors }, { status: 400 });
    }

    const section = await createSection(payload.data);
    return jsonResponse({ success: true, section });
  } catch (error) {
    if (error instanceof Error) return jsonError(error.message, 400);
    return jsonError("Could not create the section.", 500);
  }
}
