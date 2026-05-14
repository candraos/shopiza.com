import { createContactMessage } from "@/lib/services/contact";
import { jsonError, jsonResponse } from "@/lib/http";
import { enforceRateLimit, RateLimitError } from "@/lib/security/rate-limit";
import { assertSameOrigin, getClientIp } from "@/lib/security/request";
import { contactSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    await enforceRateLimit({
      action: "contact.submit",
      identifier: getClientIp(request) ?? "unknown",
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    const payload = contactSchema.safeParse(await request.json());
    if (!payload.success) {
      return jsonResponse(
        {
          success: false,
          errors: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await createContactMessage(payload.data);

    return jsonResponse({
      success: true,
      message: "Your message has been sent.",
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return jsonError(error.message, 429);
    }

    return jsonError("We could not send your message right now.", 500);
  }
}
