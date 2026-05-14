import { prisma } from "@/lib/prisma";
import { issueVerificationCodeForUser, verifyUserCode } from "@/lib/services/auth";
import { jsonError, jsonResponse } from "@/lib/http";
import { enforceRateLimit, RateLimitError } from "@/lib/security/rate-limit";
import { assertSameOrigin, getClientIp } from "@/lib/security/request";
import {
  verificationConfirmSchema,
  verificationRequestSchema,
} from "@/lib/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    await enforceRateLimit({
      action: "auth.verify",
      identifier: getClientIp(request) ?? "unknown",
      limit: 12,
      windowMs: 15 * 60 * 1000,
    });

    const payload = verificationConfirmSchema.safeParse(await request.json());
    if (!payload.success) {
      return jsonResponse(
        {
          success: false,
          errors: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await verifyUserCode(payload.data);

    const user = await prisma.user.findUnique({
      where: {
        id: payload.data.userId,
      },
      select: {
        emailVerified: true,
        phoneVerified: true,
      },
    });

    return jsonResponse({
      success: true,
      fullyVerified: user?.emailVerified && user?.phoneVerified,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return jsonError(error.message, 429);
    }

    if (error instanceof Error) {
      return jsonError(error.message, 400);
    }

    return jsonError("Verification failed.", 500);
  }
}

export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);

    await enforceRateLimit({
      action: "auth.verify.resend",
      identifier: getClientIp(request) ?? "unknown",
      limit: 6,
      windowMs: 15 * 60 * 1000,
    });

    const payload = verificationRequestSchema.safeParse(await request.json());
    if (!payload.success) {
      return jsonResponse(
        {
          success: false,
          errors: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.data.userId,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        phoneNumber: true,
        role: true,
        passwordHash: true,
        emailVerified: true,
        phoneVerified: true,
        locationAccessGranted: true,
        locationLabel: true,
        locationLatitude: true,
        locationLongitude: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return jsonError("User not found.", 404);
    }

    await issueVerificationCodeForUser(user, payload.data.channel);

    return jsonResponse({
      success: true,
      message: `A new ${payload.data.channel === "EMAIL" ? "email" : "SMS"} code was sent.`,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return jsonError(error.message, 429);
    }

    return jsonError("Could not resend the verification code.", 500);
  }
}
