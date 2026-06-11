export const APP_NAME = "Shopizaj";
export const SUPPORT_EMAIL =
  process.env.SHOPIZAJ_SUPPORT_EMAIL ?? "info@shopizaj.com";
export const SUPPORT_PHONE_NUMBER =
  process.env.SHOPIZAJ_SUPPORT_PHONE ?? "+96176329902";
export const SUPPORT_ADDRESS =
  process.env.SHOPIZAJ_SUPPORT_ADDRESS ?? "Achrafieh Alfred Naccache Road";
export const INSTAGRAM_URL =
  process.env.SHOPIZAJ_INSTAGRAM_URL ?? "https://www.instagram.com/shopizaj/";
export const FACEBOOK_URL =
  process.env.SHOPIZAJ_FACEBOOK_URL ??
  "https://www.facebook.com/profile.php?id=61590454930946";
export const AUTH_COOKIE_NAME = "shopizaj_session";
export const VERIFICATION_CODE_TTL_MINUTES = 15;
export const PENDING_REGISTRATION_TTL_MINUTES = 24 * 60;
export const PASSWORD_RESET_TTL_MINUTES = 15;
export const MAX_PRODUCT_IMAGE_BYTES = 4 * 1024 * 1024;
export const ALLOWED_PRODUCT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ORDER_STATUS_LABELS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  ON_THE_WAY: "On The Way",
  DELIVERED: "Delivered",
} as const;

export const FEATURED_SECTION_LIMIT = 4;
export const FEATURED_PRODUCT_LIMIT = 8;
