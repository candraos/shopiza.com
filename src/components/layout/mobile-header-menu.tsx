'use client';

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { ShopizaLogo } from "@/components/brand/shopiza-logo";
import { LogoutButton } from "@/components/layout/logout-button";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MobileHeaderMenuProps = {
  homeHref: string;
  items: Array<{
    href: string;
    label: string;
    exact?: boolean;
  }>;
  user?: {
    username: string;
  } | null;
};

function isActivePath(pathname: string, href: string, exact = false) {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileHeaderMenu({
  homeHref,
  items,
  user,
}: MobileHeaderMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        onClick={() => setIsOpen((value) => !value)}
        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-white text-[var(--navy-950)] shadow-[0_10px_20px_rgba(18,26,56,0.05)]"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-[rgba(18,26,56,0.16)] backdrop-blur-sm"
          />
          <div className="fixed inset-x-4 top-20 z-50 glass-card rounded-[28px] p-5 shadow-[0_18px_45px_rgba(18,26,56,0.16)]">
            <div className="flex items-start justify-between gap-4">
              <ShopizaLogo href={homeHref} />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-white text-[var(--navy-950)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {user ? (
              <p className="mt-4 text-sm font-semibold text-[var(--navy-950)]">
                {user.username}
              </p>
            ) : null}

            <nav className="mt-5 grid gap-2">
              {items.map((item) => {
                const isActive = isActivePath(pathname, item.href, item.exact);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      isActive
                        ? "bg-[rgba(244,71,161,0.08)] text-[var(--pink-500)]"
                        : "text-[var(--ink-700)] hover:bg-[rgba(244,71,161,0.08)] hover:text-[var(--pink-500)]",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-5">
              {user ? (
                <LogoutButton />
              ) : (
                <div className="grid gap-3">
                  <ButtonLink href="/login" variant="secondary">
                    Login
                  </ButtonLink>
                  <ButtonLink href="/register">Create account</ButtonLink>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
