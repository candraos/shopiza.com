import "server-only";

import { prisma } from "@/lib/prisma";

type SecurityEventInput = {
  userId?: string | null;
  eventType: string;
  message: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: string | null;
};

export async function logSecurityEvent(input: SecurityEventInput) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[security] ${input.eventType}: ${input.message}`);
  }

  try {
    await prisma.securityEvent.create({
      data: {
        userId: input.userId ?? null,
        eventType: input.eventType,
        message: input.message,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        metadata: input.metadata ?? null,
      },
    });
  } catch (error) {
    console.warn("Failed to persist security event.", error);
  }
}
