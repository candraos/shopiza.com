import Link from "next/link";

import { cn } from "@/lib/utils";

export function ShopizaLogo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full px-1 py-1",
        className,
      )}
    >
      <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-[var(--navy-950)] shadow-[0_18px_36px_rgba(17,22,48,0.28)]">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,120,193,0.7),transparent_42%),linear-gradient(135deg,#7b4dff,#f447a1)] opacity-90" />
        <span className="relative text-xl font-bold text-white">S</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className="display-title text-xl font-semibold tracking-tight text-[var(--navy-950)]">
          Shopiza
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.28em] text-[var(--ink-500)]">
          Premium Commerce
        </span>
      </span>
    </Link>
  );
}
