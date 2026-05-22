'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ORDER_STATUS_LABELS } from "@/lib/constants";

type OrderStatus = keyof typeof ORDER_STATUS_LABELS;

export function OrderStatusSelect({
  orderId,
  status,
  className,
}: {
  orderId: string;
  status: OrderStatus;
  className?: string;
}) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      aria-label="Order status"
      onClick={(event) => {
        event.stopPropagation();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
      }}
      onChange={async (event) => {
        const nextStatus = event.target.value as OrderStatus;
        const previousStatus = currentStatus;

        setCurrentStatus(nextStatus);

        const response = await fetch(`/api/admin/orders/${orderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });

        const data = (await response.json()) as { message?: string };

        if (!response.ok) {
          setCurrentStatus(previousStatus);
          toast.error(data.message ?? "Could not update the order.");
          return;
        }

        toast.success("Order status updated.");
        startTransition(() => {
          router.refresh();
        });
      }}
      className={className}
    >
      {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
