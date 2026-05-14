import { ConflictError, issueVerificationCodeForUser, registerClientUser } from "@/lib/services/auth";
import { enforceRateLimit, RateLimitError } from "@/lib/security/rate-limit";
import { assertSameOrigin, getClientIp } from "@/lib/security/request";
import { registrationSchema } from "@/lib/validation";
import { jsonError, jsonResponse } from "@/lib/http";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const payload = registrationSchema.safeParse(await request.json());
    if (!payload.success) {
      return jsonResponse(
        {
          success: false,
          errors: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await enforceRateLimit({
      action: "auth.register",
      identifier: getClientIp(request) ?? "unknown",
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    const user = await registerClientUser(payload.data);

    await Promise.all([
      issueVerificationCodeForUser(user, "EMAIL"),
      issueVerificationCodeForUser(user, "SMS"),
    ]);

    return jsonResponse({
      success: true,
      userId: user.id,
      message: "Account created. We sent verification codes to your email and phone.",
    });
  } catch (error) {
    if (error instanceof ConflictError) {
      return jsonError(error.message, 409);
    }

    if (error instanceof RateLimitError) {
      return jsonError(error.message, 429);
    }

    return jsonError("Registration failed. Please try again.", 500);
  }
}
