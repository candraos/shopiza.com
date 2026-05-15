'use client';

import { Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/ui/field";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";

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

const pickerFieldClasses =
  "w-full rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-3 text-sm text-[var(--navy-950)] shadow-[0_8px_18px_rgba(17,24,39,0.04)] outline-none placeholder:text-[var(--ink-500)] focus:border-[rgba(244,71,161,0.48)] focus:ring-4 focus:ring-[rgba(244,71,161,0.12)] disabled:cursor-not-allowed disabled:opacity-60";

function formatProductOption(product: ProductOption) {
  return `${product.name} (${formatCurrency(product.priceCents)})`;
}

function ProductPicker({
  products,
  selectedProductId,
  onSelect,
}: {
  products: ProductOption[];
  selectedProductId: string;
  onSelect: (productId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const hasAvailableProducts = products.length > 0;
  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? null;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    if (!normalizedQuery) {
      return true;
    }

    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      formatCurrency(product.priceCents).toLowerCase().includes(normalizedQuery)
    );
  });

  function closePicker() {
    setIsOpen(false);
    setQuery("");
  }

  return (
    <div
      className="flex flex-col gap-2 text-sm font-medium text-[var(--navy-950)]"
      onBlur={(event) => {
        const nextFocused = event.relatedTarget as Node | null;
        if (!nextFocused || !event.currentTarget.contains(nextFocused)) {
          closePicker();
        }
      }}
    >
      <span>Product</span>
      <input type="hidden" name="productId" value={selectedProductId} readOnly />
      <div className="relative">
        <button
          type="button"
          className={cn(
            pickerFieldClasses,
            "flex items-center justify-between gap-3 text-left",
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          disabled={!hasAvailableProducts}
          onClick={() => {
            if (!hasAvailableProducts) {
              return;
            }

            if (isOpen) {
              closePicker();
              return;
            }

            setIsOpen(true);
          }}
        >
          <span className={selectedProduct ? "" : "text-[var(--ink-500)]"}>
            {selectedProduct
              ? formatProductOption(selectedProduct)
              : "No products available"}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-[var(--ink-500)] transition-transform",
              isOpen ? "rotate-180" : "",
            )}
          />
        </button>
        {isOpen ? (
          <div className="absolute z-20 mt-2 w-full rounded-[24px] border border-[var(--line-soft)] bg-white p-3 shadow-[0_20px_45px_rgba(17,24,39,0.12)]">
            <input
              type="search"
              value={query}
              autoFocus
              onChange={(event) => setQuery(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  closePicker();
                }
              }}
              placeholder="Search by product name or price"
              className={pickerFieldClasses}
            />
            <div className="mt-3 max-h-60 overflow-y-auto" role="listbox">
              {filteredProducts.length > 0 ? (
                <div className="grid gap-2">
                  {filteredProducts.map((product) => {
                    const isSelected = product.id === selectedProductId;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition",
                          isSelected
                            ? "border-[rgba(244,71,161,0.42)] bg-[rgba(244,71,161,0.08)] text-[var(--navy-950)]"
                            : "border-transparent bg-[rgba(19,24,47,0.03)] text-[var(--navy-950)] hover:border-[var(--line-soft)] hover:bg-white",
                        )}
                        onClick={() => {
                          onSelect(product.id);
                          closePicker();
                        }}
                      >
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[var(--ink-500)]">
                            {formatCurrency(product.priceCents)}
                          </p>
                        </div>
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-2xl bg-[rgba(19,24,47,0.03)] px-4 py-5 text-sm text-[var(--ink-500)]">
                  No available products match this search.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
      {!hasAvailableProducts ? (
        <p className="text-xs text-[var(--ink-500)]">
          Products that already have a discount are hidden from this list.
        </p>
      ) : null}
    </div>
  );
}

export function DiscountsManager({
  discounts,
  products,
}: {
  discounts: DiscountItem[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [startImmediately, setStartImmediately] = useState(true);
  const [requestedProductId, setRequestedProductId] = useState(products[0]?.id ?? "");
  const hasAvailableProducts = products.length > 0;
  const selectedProduct =
    products.find((product) => product.id === requestedProductId) ??
    products[0] ??
    null;
  const selectedProductId = selectedProduct?.id ?? "";

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
          const form = event.currentTarget;
          const formData = new FormData(form);
          const productId = String(formData.get("productId") ?? "");
          const product = products.find((item) => item.id === productId);

          if (!productId || !product) {
            toast.error("Select a product.");
            setPending(false);
            return;
          }

          const payload = {
            productId,
            type: String(formData.get("type") ?? "PERCENTAGE"),
            value: Number(formData.get("value") ?? "0"),
            priceCents: product?.priceCents ?? 0,
            startAt: startImmediately
              ? ""
              : String(formData.get("startAt") ?? ""),
            endAt: String(formData.get("endAt") ?? ""),
            startImmediately,
            isActive: true,
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
          form.reset();
          setStartImmediately(true);
          setPending(false);
          router.refresh();
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Create discount
        </p>
        <div className="mt-6 grid gap-4">
          <ProductPicker
            products={products}
            selectedProductId={selectedProductId}
            onSelect={setRequestedProductId}
          />
          <SelectField label="Discount type" name="type" defaultValue="PERCENTAGE">
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed amount</option>
          </SelectField>
          <TextField label="Value" name="value" type="number" step="1" min="1" required />
          {startImmediately ? null : (
            <TextField
              label="Start at"
              name="startAt"
              type="datetime-local"
              required
            />
          )}
          <TextField label="End at" name="endAt" type="datetime-local" required />
          <label className="inline-flex items-center gap-3 text-sm font-medium text-[var(--navy-950)]">
            <input
              type="checkbox"
              checked={startImmediately}
              onChange={(event) => setStartImmediately(event.currentTarget.checked)}
              className="h-4 w-4"
            />
            Active immediately
          </label>
          <Button type="submit" disabled={pending || !hasAvailableProducts || !selectedProductId}>
            {pending ? "Saving..." : "Create discount"}
          </Button>
        </div>
      </form>
    </div>
  );
}
