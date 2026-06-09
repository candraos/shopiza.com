import Link from "next/link";

import { ShopizajLogo } from "@/components/brand/shopizaj-logo";

function getWhatsAppUrl(phoneNumber: string) {
  return `https://wa.me/${phoneNumber.replace(/[^\d]/g, "")}`;
}

function getInstagramUrl(handle: string) {
  return `https://instagram.com/${handle.replace(/\s+/g, "")}`;
}

function getFacebookUrl(handle: string) {
  return `https://facebook.com/${handle.replace(/\s+/g, "")}`;
}

export function SiteFooter({
  supportAddress,
  supportEmail,
  supportPhoneNumber,
  facebookHandle,
  instagramHandle,
}: {
  supportAddress: string;
  supportEmail: string;
  supportPhoneNumber: string;
  facebookHandle: string;
  instagramHandle: string;
}) {
  return (
    <footer className="mt-16 border-t border-[rgba(19,24,47,0.08)] bg-white/70">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-[1.3fr_0.9fr_1.2fr]">
        <div className="space-y-4">
          <ShopizajLogo />
          <p className="max-w-md text-sm leading-7 text-[var(--ink-700)]">
            Shopizaj contact details and social channels are available here for
            support, orders, and WhatsApp inquiries.
          </p>
        </div>
        <div>
          <h3 className="display-title text-lg font-semibold text-[var(--navy-950)]">
            Explore
          </h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--ink-700)]">
            <Link href="/products">All products</Link>
            <Link href="/account">My profile</Link>
            <Link href="/account/orders">My orders</Link>
          </div>
        </div>
        <div>
          <h3 className="display-title text-lg font-semibold text-[var(--navy-950)]">
            Support
          </h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--ink-700)]">
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            <a href={getWhatsAppUrl(supportPhoneNumber)} target="_blank" rel="noreferrer">
              {supportPhoneNumber} on WhatsApp
            </a>
            <p>{supportAddress}</p>
            <a href={getFacebookUrl(facebookHandle)} target="_blank" rel="noreferrer">
              Facebook: {facebookHandle}
            </a>
            <a href={getInstagramUrl(instagramHandle)} target="_blank" rel="noreferrer">
              Instagram: {instagramHandle}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
