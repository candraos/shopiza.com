import { SUPPORT_PHONE_NUMBER } from "@/lib/constants";

function getWhatsAppUrl(phoneNumber: string) {
  const cleaned = phoneNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${cleaned}`;
}

export function WhatsAppFloat() {
  return (
    <a
      href={getWhatsAppUrl(SUPPORT_PHONE_NUMBER)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-[0_8px_28px_rgba(37,211,102,0.4)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:right-6"
    >
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
        <path
          d="M16 2C8.3 2 2 8.3 2 16c0 2.5.7 4.9 1.9 7L2 30l7.3-1.9C11.1 29.3 13.5 30 16 30c7.7 0 14-6.3 14-14S23.7 2 16 2z"
          fill="white"
        />
        <path
          d="M21.8 19c-.3-.1-1.9-.9-2.2-1-.3-.1-.5-.1-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.3-.7.1-.3-.2-1.4-.5-2.7-1.7-1-1-1.7-2.1-1.9-2.5-.2-.4 0-.6.1-.7l.6-.7c.1-.2.2-.4.3-.6.1-.2 0-.4-.1-.5-.1-.2-.7-1.9-1-2.6-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.7.1-1 .4-.4.4-1.3 1.2-1.3 3s1.3 3.5 1.5 3.7c.2.3 2.6 4.1 6.4 5.6 3.7 1.5 3.7 1 4.4.9.7-.1 2.1-.8 2.4-1.6.3-.8.3-1.5.2-1.6-.1-.1-.5-.3-.8-.4z"
          fill="#25D366"
        />
      </svg>
    </a>
  );
}
