import { env } from "@/lib/env";

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return request.headers.get("x-real-ip");
}

export function assertSameOrigin(request: Request) {
  const method = request.method.toUpperCase();

  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return;
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    return;
  }

  const originHost = new URL(origin).host;
  const allowedHost = new URL(env.appUrl).host;

  if (originHost !== host && originHost !== allowedHost) {
    throw new Error("Invalid request origin.");
  }
}
