'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/ui/field";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type DiscountItem = {
  id: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  discountedPriceCents: number;
  startAt: Date;
  endAt: Date;
  isActive: boolean;
  product: {
    id: string;
    name: string;
    priceCents: number;
  };
};

type ProductOption = {
  id: string;
  name: string;
  priceCents: number;
};

export function DiscountsManager({
  discounts,
  products,
}: {
  discounts: DiscountItem[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const hasAvailableProducts = products.length > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="glass-card rounded-[32px] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Existing discounts
        </p>
        <div className="mt-5 grid gap-3">
          {discounts.map((discount) => (
            <article
              key={discount.id}
              className="rounded-[24px] border border-[var(--line-soft)] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="display-title text-2xl font-semibold text-[var(--navy-950)]">
                    {discount.product.name}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--ink-700)]">
                    Now {formatCurrency(discount.discountedPriceCents)} •{" "}
                    {discount.type === "PERCENTAGE"
                      ? `${discount.value}% off`
                      : `${formatCurrency(discount.value)} off`}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.26em] text-[var(--ink-500)]">
                    {formatDateTime(discount.startAt)} to {formatDateTime(discount.endAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="danger"
                  onClick={async () => {
                    if (!window.confirm("Delete this discount?")) {
                      return;
                    }

                    const response = await fetch(`/api/admin/discounts/${discount.id}`, {
                      method: "DELETE",
                    });
                    const data = (await response.json()) as { message?: string };
                    if (!response.ok) {
                      toast.error(data.message ?? "Could not delete the discount.");
                      return;
                    }
                    toast.success("Discount deleted.");
                    router.refresh();
                  }}
                >
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <form
        className="glass-card rounded-[32px] p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          const formData = new FormData(event.currentTarget);
          const productId = String(formData.get("productId") ?? "");
          const product = products.find((item) => item.id === productId);
          const payload = {
            productId,
            type: String(formData.get("type") ?? "PERCENTAGE"),
            value: Number(formData.get("value") ?? "0"),
            priceCents: product?.priceCents ?? 0,
            startAt: String(formData.get("startAt") ?? ""),
            endAt: String(formData.get("endAt") ?? ""),
            isActive: formData.get("isActive") === "on",
          };

          const response = await fetch("/api/admin/discounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = (await response.json()) as { message?: string };
          if (!response.ok) {
            toast.error(data.message ?? "Could not save the discount.");
            setPending(false);
            return;
          }

          toast.success("Discount created.");
          event.currentTarget.reset();
          setPending(false);
          router.refresh();
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Create discount
        </p>
        <div className="mt-6 grid gap-4">
          <SelectField
            label="Product"
            name="productId"
            defaultValue={products[0]?.id ?? ""}
            disabled={!hasAvailableProducts}
          >
            {hasAvailableProducts ? (
              products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({formatCurrency(product.priceCents)})
                </option>
              ))
            ) : (
              <option value="">No products available</option>
            )}
          </SelectField>
          {!hasAvailableProducts ? (
            <p className="text-xs text-[var(--ink-500)]">
              Products with a current discount are hidden from this list.
            </p>
          ) : null}
          <SelectField label="Discount type" name="type" defaultValue="PERCENTAGE">
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed amount</option>
          </SelectField>
          <TextField label="Value" name="value" type="number" step="1" min="1" />
          <TextField label="Start at" name="startAt" type="datetime-local" />
          <TextField label="End at" name="endAt" type="datetime-local" />
          <label className="inline-flex items-center gap-3 text-sm font-medium text-[var(--navy-950)]">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4" />
            Active immediately
          </label>
          <Button type="submit" disabled={pending || !hasAvailableProducts}>
            {pending ? "Saving..." : "Create discount"}
          </Button>
        </div>
      </form>
    </div>
  );
}
