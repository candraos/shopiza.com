import Link from "next/link";
import { LayoutGrid, Package2, Tags, Layers3, ClipboardList } from "lucide-react";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/products", label: "Products", icon: Package2 },
  { href: "/admin/sections", label: "Sections", icon: Layers3 },
  { href: "/admin/discounts", label: "Discounts", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
];

export function AdminNav() {
  return (
    <nav className="grid gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--ink-700)] hover:bg-[rgba(244,71,161,0.08)] hover:text-[var(--pink-500)]"
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
