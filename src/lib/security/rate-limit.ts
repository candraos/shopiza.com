import "server-only";

import { prisma } from "@/lib/prisma";

export class RateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super("Too many requests.");
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

type RateLimitOptions = {
  action: string;
  identifier: string;
  limit: number;
  windowMs: number;
};

export async function enforceRateLimit({
  action,
  identifier,
  limit,
  windowMs,
}: RateLimitOptions) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  await prisma.$transaction(async (transaction) => {
    await transaction.rateLimitEvent.deleteMany({
      where: {
        createdAt: {
          lt: windowStart,
        },
      },
    });

    const count = await transaction.rateLimitEvent.count({
      where: {
        action,
        identifier,
        createdAt: {
          gte: windowStart,
        },
      },
    });

    if (count >= limit) {
      throw new RateLimitError(Math.ceil(windowMs / 1000));
    }

    await transaction.rateLimitEvent.create({
      data: {
        action,
        identifier,
      },
    });
  });
}
