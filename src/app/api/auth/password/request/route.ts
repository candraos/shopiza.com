import { issuePasswordResetCode } from "@/lib/services/auth";
import { jsonError, jsonResponse } from "@/lib/http";
import { enforceRateLimit, RateLimitError } from "@/lib/security/rate-limit";
import { assertSameOrigin, getClientIp } from "@/lib/security/request";
import { passwordResetRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    await enforceRateLimit({
      action: "auth.password.request",
      identifier: getClientIp(request) ?? "unknown",
      limit: 6,
      windowMs: 15 * 60 * 1000,
    });

    const payload = passwordResetRequestSchema.safeParse(await request.json());
    if (!payload.success) {
      return jsonResponse(
        {
          success: false,
          errors: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await issuePasswordResetCode(
      payload.data.identifier,
      payload.data.channel,
    );

    return jsonResponse({
      success: true,
      message: "If an account exists, a reset code has been sent.",
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return jsonError(error.message, 429);
    }

    return jsonError("Could not process the reset request.", 500);
  }
}
