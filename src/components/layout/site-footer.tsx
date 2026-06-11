import Link from "next/link";

import { ShopizajLogo } from "@/components/brand/shopizaj-logo";

function getWhatsAppUrl(phoneNumber: string) {
  return `https://wa.me/${phoneNumber.replace(/[^\d]/g, "")}`;
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="64" height="64" rx="12" fill="#F97316" />
      {/* envelope perfectly centered: 46×30 box → x=9, y=17 */}
      <rect x="9" y="17" width="46" height="30" rx="3" stroke="white" strokeWidth="3" fill="none" />
      <polyline points="9,17 32,34 55,17" stroke="white" strokeWidth="3" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="22" height="22" rx="4.5" fill="#25D366" />
      <g transform="translate(3, 3)">
        <path
          fill="white"
          fillRule="evenodd"
          d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"
        />
      </g>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="64" height="64" rx="12" fill="#1877F2" />
      {/* f glyph centered: stem from y=13 to y=51, crossbar at y=33 */}
      <path
        d="M38 13h-5c-3.3 0-6 2.7-6 6v5h-4v7h4v17h7V31h5l1-7h-6v-4c0-1.1.9-2 2-2h4V13z"
        fill="white"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFDC80" />
          <stop offset="25%" stopColor="#FCAF45" />
          <stop offset="50%" stopColor="#F77737" />
          <stop offset="75%" stopColor="#C13584" />
          <stop offset="100%" stopColor="#833AB4" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="12" fill="url(#ig-grad)" />
      {/* camera: 36×36 centered → x=14, y=14 */}
      <rect x="14" y="14" width="36" height="36" rx="9" stroke="white" strokeWidth="3" fill="none" />
      {/* lens: r=9 centered */}
      <circle cx="32" cy="32" r="9" stroke="white" strokeWidth="3" fill="none" />
      {/* viewfinder dot: top-right inner corner */}
      <circle cx="43" cy="21" r="2.5" fill="white" />
    </svg>
  );
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
      <div className="container-shell grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        {/* Brand + contact info */}
        <div className="space-y-4">
          <ShopizajLogo />
          <div className="text-sm leading-7 text-(--ink-700)">
            <p>
              <span className="font-semibold text-(--navy-950)">Email:</span>{" "}
              <a href={`mailto:${supportEmail}`} className="hover:underline">
                {supportEmail}
              </a>
            </p>
            <p>
              <span className="font-semibold text-(--navy-950)">Tel:</span>{" "}
              <a href={`tel:${supportPhoneNumber}`} className="hover:underline">
                {supportPhoneNumber}
              </a>
            </p>
            <p>
              <span className="font-semibold text-(--navy-950)">Address:</span>{" "}
              {supportAddress}
            </p>
            <p>Beirut, Lebanon</p>
          </div>
        </div>

        {/* Explore */}
        <div>
          <h3 className="display-title text-lg font-semibold text-(--navy-950)">
            Explore
          </h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-(--ink-700)">
            <Link href="/products" className="hover:underline">
              All products
            </Link>
            <Link href="/account/orders" className="hover:underline">
              My orders
            </Link>
          </div>
        </div>

        {/* Support icons */}
        <div>
          <h3 className="display-title text-lg font-semibold text-(--navy-950)">
            Support
          </h3>
          <div className="mt-4 flex gap-3">
            <a
              href={`mailto:${supportEmail}`}
              aria-label="Email"
              className="h-14 w-14 transition-opacity hover:opacity-80"
            >
              <EmailIcon />
            </a>
            <a
              href={getWhatsAppUrl(supportPhoneNumber)}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="h-14 w-14 transition-opacity hover:opacity-80"
            >
              <WhatsAppIcon />
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="h-14 w-14 transition-opacity hover:opacity-80"
            >
              <FacebookIcon />
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="h-14 w-14 transition-opacity hover:opacity-80"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
