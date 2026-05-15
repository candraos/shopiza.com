'use client';

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string, exact: boolean) {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({
  href,
  children,
  exact = false,
  className,
}: {
  href: string;
  children: ReactNode;
  exact?: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const isActive = isActivePath(pathname, href, exact);

  return (
    <Link
      href={href}
      className={cn(
        "relative inline-flex items-center py-1 transition-colors hover:text-[var(--pink-500)]",
        isActive
          ? "text-[var(--pink-500)] after:absolute after:-bottom-3 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[var(--pink-500)]"
          : "text-[var(--ink-700)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
