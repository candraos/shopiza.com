import Link from "next/link";

import { ShopizajLogo } from "@/components/brand/shopizaj-logo";

function getWhatsAppUrl(phoneNumber: string) {
  return `https://wa.me/${phoneNumber.replace(/[^\d]/g, "")}`;
}

export function SiteFooter({
  supportAddress,
  supportEmail,
  supportPhoneNumber,
  facebookUrl,
  instagramUrl,
}: {
  supportAddress: string;
  supportEmail: string;
  supportPhoneNumber: string;
  facebookUrl: string;
  instagramUrl: string;
}) {
  return (
    <footer className="mt-16 border-t border-[rgba(19,24,47,0.08)] bg-white/70">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-[1.3fr_0.9fr_1fr_0.8fr]">
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
            <Link href="/account/orders">My orders</Link>
          </div>
        </div>
        <div>
          <h3 className="display-title text-lg font-semibold text-[var(--navy-950)]">
            Contact
          </h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--ink-700)]">
            <a href={`mailto:${supportEmail}`}>Email us</a>
            <a href={getWhatsAppUrl(supportPhoneNumber)} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <p>{supportAddress}</p>
          </div>
        </div>
        <div>
          <h3 className="display-title text-lg font-semibold text-[var(--navy-950)]">
            Social Media
          </h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--ink-700)]">
            <a href={facebookUrl} target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href={instagramUrl} target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
