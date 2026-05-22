import { notFound } from "next/navigation";

import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { getAdminOrderById } from "@/lib/services/orders";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Orders
        </p>
        <h1 className="mt-2 display-title text-4xl font-semibold text-[var(--navy-950)]">
          Order details
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-700)]">
          Review client details, delivery location, and ordered items.
        </p>
      </div>

      <section className="glass-card rounded-[32px] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--pink-500)]">
              {order.orderNumber}
            </p>
            <h2 className="mt-2 display-title text-2xl font-semibold text-[var(--navy-950)]">
              {order.clientName}
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-500)]">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="space-y-3 text-right">
            <p className="text-sm font-medium text-[var(--ink-500)]">Status</p>
            <OrderStatusSelect
              orderId={order.id}
              status={order.status}
              className="min-w-44 rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm font-semibold text-[var(--navy-950)]"
            />
            <p className="text-xl font-semibold text-[var(--navy-950)]">
              {formatCurrency(order.totalPriceCents)}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-[var(--line-soft)] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--pink-500)]">
              Contact
            </p>
            <div className="mt-4 space-y-3 text-sm text-[var(--ink-700)]">
              <p>
                <span className="font-semibold text-[var(--navy-950)]">Email:</span>{" "}
                {order.clientEmail}
              </p>
              <p>
                <span className="font-semibold text-[var(--navy-950)]">Phone:</span>{" "}
                {order.clientPhoneNumber}
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--line-soft)] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--pink-500)]">
              Delivery
            </p>
            <div className="mt-4 space-y-3 text-sm text-[var(--ink-700)]">
              <p>
                <span className="font-semibold text-[var(--navy-950)]">Order ID:</span>{" "}
                {order.orderNumber}
              </p>
              <p>
                <span className="font-semibold text-[var(--navy-950)]">Location:</span>{" "}
                {order.destinationLocation}
              </p>
              <p>
                <span className="font-semibold text-[var(--navy-950)]">Payment:</span>{" "}
                Cash on delivery
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card rounded-[32px] p-6">
        <h2 className="display-title text-2xl font-semibold text-[var(--navy-950)]">
          Order items
        </h2>
        <div className="mt-6 grid gap-4">
          {order.items.map((item) => (
            <article
              key={item.id}
              className="rounded-[24px] border border-[var(--line-soft)] bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--navy-950)]">
                    {item.productNameSnapshot}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--ink-700)]">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right text-sm text-[var(--ink-700)]">
                  <p>
                    Unit price:{" "}
                    <span className="font-semibold text-[var(--navy-950)]">
                      {formatCurrency(item.unitPriceSnapshotCents)}
                    </span>
                  </p>
                  <p className="mt-2">
                    Line total:{" "}
                    <span className="font-semibold text-[var(--navy-950)]">
                      {formatCurrency(item.totalPriceSnapshotCents)}
                    </span>
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
