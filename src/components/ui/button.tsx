import { type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const buttonClasses =
  "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold tracking-tight transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary:
    "pill-shadow bg-[linear-gradient(135deg,var(--pink-500),var(--purple-500))] text-white hover:shadow-[0_18px_35px_rgba(123,77,255,0.22)]",
  secondary:
    "border border-[var(--line-soft)] bg-white text-[var(--navy-950)] hover:border-[rgba(244,71,161,0.35)] hover:text-[var(--pink-500)]",
  dark: "bg-[var(--navy-950)] text-white hover:bg-[var(--navy-800)]",
  ghost:
    "bg-transparent text-[var(--navy-950)] hover:bg-[rgba(19,24,47,0.05)]",
  danger:
    "bg-[var(--danger-500)] text-white hover:bg-[color-mix(in_oklab,var(--danger-500),black_12%)]",
} as const;

type CommonProps = {
  variant?: keyof typeof variants;
  className?: string;
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & CommonProps) {
  return (
    <button
      className={cn(buttonClasses, variants[variant], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> &
  CommonProps & {
    href: string;
  }) {
  return (
    <Link
      href={href}
      className={cn(buttonClasses, variants[variant], className)}
      {...props}
    />
  );
}
