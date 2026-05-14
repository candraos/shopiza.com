import { setAuthSession } from "@/lib/auth/session";
import { authenticateUser } from "@/lib/services/auth";
import { jsonError, jsonResponse } from "@/lib/http";
import { enforceRateLimit, RateLimitError } from "@/lib/security/rate-limit";
import { assertSameOrigin, getClientIp } from "@/lib/security/request";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    await enforceRateLimit({
      action: "auth.login",
      identifier: getClientIp(request) ?? "unknown",
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });

    const payload = loginSchema.safeParse(await request.json());

    if (!payload.success) {
      return jsonResponse(
        {
          success: false,
          errors: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const user = await authenticateUser(
      payload.data.identifier,
      payload.data.password,
    );

    await setAuthSession({
      userId: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
    });

    return jsonResponse({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return jsonError(error.message, 429);
    }

    if (error instanceof Error) {
      return jsonError(error.message, 401);
    }

    return jsonError("Login failed. Please try again.", 500);
  }
}
