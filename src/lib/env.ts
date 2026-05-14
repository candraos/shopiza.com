const isProduction = process.env.NODE_ENV === "production";

function requiredInProduction(value: string | undefined, fallback: string) {
  if (value) {
    return value;
  }

  if (isProduction) {
    throw new Error("Missing required environment variable in production.");
  }

  return fallback;
}

export const env = {
  appUrl: process.env.SHOPIZA_APP_URL ?? "http://localhost:3000",
  sessionSecret: requiredInProduction(
    process.env.SESSION_SECRET,
    "shopiza-dev-session-secret-change-me",
  ),
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER ?? "",
    password: process.env.SMTP_PASSWORD ?? "",
    from:
      process.env.SMTP_FROM ?? "Shopiza <no-reply@shopiza.local>",
  },
  smsMode: process.env.SMS_PROVIDER_MODE ?? "log",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  googleMapsMapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "",
};
