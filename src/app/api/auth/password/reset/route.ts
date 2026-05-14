import { resetPasswordWithCode } from "@/lib/services/auth";
import { jsonError, jsonResponse } from "@/lib/http";
import { enforceRateLimit, RateLimitError } from "@/lib/security/rate-limit";
import { assertSameOrigin, getClientIp } from "@/lib/security/request";
import { passwordResetConfirmSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    await enforceRateLimit({
      action: "auth.password.reset",
      identifier: getClientIp(request) ?? "unknown",
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });

    const payload = passwordResetConfirmSchema.safeParse(await request.json());
    if (!payload.success) {
      return jsonResponse(
        {
          success: false,
          errors: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await resetPasswordWithCode({
      identifier: payload.data.identifier,
      channel: payload.data.channel,
      code: payload.data.code,
      newPassword: payload.data.newPassword,
    });

    return jsonResponse({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return jsonError(error.message, 429);
    }

    if (error instanceof Error) {
      return jsonError(error.message, 400);
    }

    return jsonError("Could not change the password.", 500);
  }
}
