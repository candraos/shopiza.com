import { MessageCircle } from "lucide-react";

import { buildWhatsAppUrl } from "@/lib/utils";

export function WhatsAppFloat() {
  return (
    <a
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full bg-[linear-gradient(135deg,var(--pink-500),var(--purple-500))] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(244,71,161,0.3)] hover:-translate-y-0.5"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Chat with us on WhatsApp</span>
      <span className="sm:hidden">WhatsApp</span>
    </a>
  );
}
