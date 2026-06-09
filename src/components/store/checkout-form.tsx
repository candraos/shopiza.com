'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useCart } from "@/components/store/cart-provider";
import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/field";
import { formatCurrency } from "@/lib/utils";

function buildDestinationLocation(input: {
  buildingNumber: string;
  streetAddress: string;
  area: string;
  city: string;
  deliveryNotes: string;
}) {
  const parts = [
    input.buildingNumber.trim()
      ? `Building ${input.buildingNumber.trim()}`
      : "",
    input.streetAddress.trim(),
    input.city.trim(),
    input.area.trim(),
  ].filter(Boolean);

  const addressLine = parts.join(", ");
  const notes = input.deliveryNotes.trim();

  return notes ? `${addressLine}, Notes: ${notes}` : addressLine;
}

export function CheckoutForm({
  userName,
}: {
  userName: string;
}) {
  const router = useRouter();
  const { cart, sessionId, clearCart } = useCart();
  const [address, setAddress] = useState({
    buildingNumber: "",
    streetAddress: "",
    area: "",
    city: "",
    deliveryNotes: "",
  });
  const [pending, setPending] = useState(false);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="glass-card rounded-[36px] p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Delivery details
        </p>
        <h1 className="mt-3 display-title text-3xl font-semibold text-[var(--navy-950)]">
          Checkout for {userName}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-700)]">
          Cash on delivery only. Enter the delivery address exactly as you want
          it to appear on the order and in the confirmation email.
        </p>
        <div className="mt-8 grid gap-4">
          <TextField
            label="Building number"
            name="buildingNumber"
            value={address.buildingNumber}
            onChange={(event) =>
              setAddress((current) => ({
                ...current,
                buildingNumber: event.target.value,
              }))
            }
          />
          <TextField
            label="Street address"
            name="streetAddress"
            autoComplete="street-address"
            value={address.streetAddress}
            onChange={(event) =>
              setAddress((current) => ({
                ...current,
                streetAddress: event.target.value,
              }))
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Area"
              name="area"
              autoComplete="address-level3"
              value={address.area}
              onChange={(event) =>
                setAddress((current) => ({
                  ...current,
                  area: event.target.value,
                }))
              }
            />
            <TextField
              label="City"
              name="city"
              autoComplete="address-level2"
              value={address.city}
              onChange={(event) =>
                setAddress((current) => ({
                  ...current,
                  city: event.target.value,
                }))
              }
            />
          </div>
          <TextAreaField
            label="Delivery notes"
            name="deliveryNotes"
            value={address.deliveryNotes}
            onChange={(event) =>
              setAddress((current) => ({
                ...current,
                deliveryNotes: event.target.value,
              }))
            }
          />
        </div>
        <Button
          type="button"
          className="mt-6"
          disabled={pending || cart.items.length === 0}
          onClick={async () => {
            if (!sessionId) {
              toast.error("Your cart session is missing.");
              return;
            }

            setPending(true);
            const destinationLocation = buildDestinationLocation(address);

            if (!destinationLocation) {
              toast.error("Enter the delivery address before submitting.");
              setPending(false);
              return;
            }

            const response = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cartSessionId: sessionId,
                destinationLocation,
                destinationLatitude: null,
                destinationLongitude: null,
                destinationPlaceId: null,
              }),
            });

            const data = (await response.json()) as {
              message?: string;
              orderNumber?: string;
            };

            if (!response.ok) {
              toast.error(data.message ?? "Checkout failed.");
              setPending(false);
              return;
            }

            toast.success(`Order ${data.orderNumber} confirmed.`);
            await clearCart();
            router.push("/account/orders");
            router.refresh();
          }}
        >
          {pending ? "Submitting order..." : "Submit order"}
        </Button>
      </section>

      <aside className="glass-card h-fit rounded-[36px] p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Summary
        </p>
        <div className="mt-6 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-semibold text-[var(--navy-950)]">{item.product.name}</p>
                <p className="text-[var(--ink-500)]">Qty {item.quantity}</p>
              </div>
              <p className="font-semibold text-[var(--navy-950)]">
                {formatCurrency(item.totalPriceCents)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-[var(--line-soft)] pt-6">
          <div className="flex items-center justify-between text-base font-semibold text-[var(--navy-950)]">
            <span>Total</span>
            <span>{formatCurrency(cart.subtotalCents)}</span>
          </div>
          <p className="mt-3 text-sm text-[var(--ink-700)]">
            Payment method: Cash on delivery.
          </p>
        </div>
      </aside>
    </div>
  );
}
