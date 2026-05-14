import { clearAuthSession } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/security/request";
import { jsonResponse } from "@/lib/http";

export async function POST(request: Request) {
  assertSameOrigin(request);
  await clearAuthSession();

  return jsonResponse({ success: true });
}
