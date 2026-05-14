'use client';

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { useCart } from "@/components/store/cart-provider";

export function CartIconLink() {
  const { cart } = useCart();

  return (
    <Link
      href="/cart"
      className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-white text-[var(--navy-950)] shadow-[0_10px_20px_rgba(18,26,56,0.05)] hover:-translate-y-0.5 hover:text-[var(--pink-500)]"
      aria-label="Open cart"
    >
      <ShoppingBag className="h-5 w-5" />
      <span className="absolute -right-1 -top-1 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[var(--pink-500)] px-1 text-[11px] font-semibold text-white">
        {cart.itemCount}
      </span>
    </Link>
  );
}
