import { type OrderStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ButtonLink } from "@/components/ui/button";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { getOrdersByUserId } from "@/lib/services/orders";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";

const ORDER_STATUS_VALUES = [
  "PENDING",
  "IN_PROGRESS",
  "ON_THE_WAY",
  "DELIVERED",
] as const satisfies readonly OrderStatus[];

const FILTER_OPTIONS = [
  { value: "ALL", label: "All" },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
    value: value as OrderStatus,
    label,
  })),
] as const;

function resolveStatusFilter(
  value: string | string[] | undefined,
): OrderStatus | "ALL" {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate || candidate === "all") {
    return "ALL";
  }

  return ORDER_STATUS_VALUES.includes(candidate as OrderStatus)
    ? (candidate as OrderStatus)
    : "ALL";
}

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const { page, status } = await searchParams;
  const statusFilter = resolveStatusFilter(status);
  const currentPage = Math.max(1, Number(page ?? "1"));

  const buildOrdersHref = (nextPage: number, nextStatus: OrderStatus | "ALL") => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));

    if (nextStatus !== "ALL") {
      params.set("status", nextStatus);
    }

    return `/account/orders?${params.toString()}`;
  };

  const { orders, totalPages } = await getOrdersByUserId({
    userId: user.id,
    page: currentPage,
    pageSize: 6,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  return (
    <div className="container-shell space-y-8 py-12">
      <div className="glass-card rounded-[36px] p-8 text-center">
        <h1 className="display-title text-4xl font-semibold text-[var(--navy-950)]">
          Your orders
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => {
          const isActive = option.value === statusFilter;

          return (
            <Link
              key={option.value}
              href={buildOrdersHref(1, option.value)}
              className={cn(
                "inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5",
                isActive
                  ? "border-transparent bg-[var(--navy-950)] text-white"
                  : "border-[var(--line-soft)] bg-white text-[var(--navy-950)] hover:border-[rgba(244,71,161,0.35)] hover:text-[var(--pink-500)]",
              )}
            >
              {option.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title={statusFilter === "ALL" ? "No orders yet" : "No matching orders"}
          description={
            statusFilter === "ALL"
              ? "Add products to your cart and complete checkout to see your order history here."
              : "You do not have any orders in this status right now."
          }
          ctaLabel="Browse products"
          ctaHref="/products"
        />
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <article key={order.id} className="glass-card rounded-[32px] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--pink-500)]">
                    {order.orderNumber}
                  </p>
                  <h2 className="mt-2 display-title text-2xl font-semibold text-[var(--navy-950)]">
                    {ORDER_STATUS_LABELS[order.status]}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--ink-700)]">
                    {formatDateTime(order.createdAt)} | {order.destinationLocation}
                  </p>
                </div>
                <p className="text-xl font-semibold text-[var(--navy-950)]">
                  {formatCurrency(order.totalPriceCents)}
                </p>
              </div>
              <div className="mt-5 grid gap-2 text-sm text-[var(--ink-700)]">
                {order.items.map((item) => (
                  <p key={item.id}>
                    {item.productNameSnapshot} x{item.quantity}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <ButtonLink
          href={buildOrdersHref(Math.max(1, currentPage - 1), statusFilter)}
          variant="secondary"
          className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
        >
          Previous
        </ButtonLink>
        <p className="text-sm text-[var(--ink-700)]">
          Page {currentPage} of {totalPages}
        </p>
        <ButtonLink
          href={buildOrdersHref(Math.min(totalPages, currentPage + 1), statusFilter)}
          variant="secondary"
          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
        >
          Next
        </ButtonLink>
      </div>
    </div>
  );
}
