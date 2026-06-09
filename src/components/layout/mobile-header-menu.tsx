'use client';

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ShopizajLogo } from "@/components/brand/shopizaj-logo";
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
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const { body, documentElement } = document;
    const scrollY = window.scrollY;
    const originalBodyOverflow = body.style.overflow;
    const originalBodyPosition = body.style.position;
    const originalBodyTop = body.style.top;
    const originalBodyWidth = body.style.width;
    const originalHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.overflow = originalBodyOverflow;
      body.style.position = originalBodyPosition;
      body.style.top = originalBodyTop;
      body.style.width = originalBodyWidth;
      documentElement.style.overflow = originalHtmlOverflow;
      window.scrollTo(0, scrollY);
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

      <div
        aria-hidden={!isOpen}
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed inset-0 z-50 flex h-dvh max-h-dvh flex-col overflow-x-hidden overflow-y-auto bg-white px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] transition-transform duration-300 ease-out sm:px-5",
          isOpen ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-4">
            <ShopizajLogo href={homeHref} />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-white text-[var(--navy-950)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex min-h-0 flex-1 flex-col">
            {user ? (
              <p className="shrink-0 text-sm font-semibold text-[var(--navy-950)]">
                {user.username}
              </p>
            ) : null}

            <div className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
              <nav className="grid content-start auto-rows-max gap-2">
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
            </div>

            <div className="mt-6 shrink-0 border-t border-[var(--line-soft)] pt-5">
              {user ? (
                <LogoutButton onLogout={() => setIsOpen(false)} />
              ) : (
                <div className="grid gap-3">
                  <ButtonLink
                    href="/login"
                    variant="secondary"
                    onClick={(event) => {
                      event.preventDefault();
                      setIsOpen(false);
                      router.push("/login");
                    }}
                  >
                    Login
                  </ButtonLink>
                  <ButtonLink
                    href="/register"
                    onClick={(event) => {
                      event.preventDefault();
                      setIsOpen(false);
                      router.push("/register");
                    }}
                  >
                    Create account
                  </ButtonLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
