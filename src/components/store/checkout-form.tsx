'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useCart } from "@/components/store/cart-provider";
import { LocationPicker } from "@/components/store/location-picker";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function CheckoutForm({
  userName,
}: {
  userName: string;
}) {
  const router = useRouter();
  const { cart, sessionId, clearCart } = useCart();
  const [location, setLocation] = useState({
    label: "",
    latitude: null as number | null,
    longitude: null as number | null,
    placeId: null as string | null,
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
          Cash on delivery only. For this order, use Google Maps below to either
          pick your current location or choose another destination. We store that
          delivery selection with this order.
        </p>
        <div className="mt-8">
          <LocationPicker value={location} onChange={setLocation} />
        </div>
        <Button
          type="button"
          className="mt-6"
          disabled={pending || cart.items.length === 0}
          onClick={async () => {
            if (!sessionId || !location.label) {
              toast.error("Choose a destination location before submitting.");
              return;
            }

            setPending(true);
            const response = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cartSessionId: sessionId,
                destinationLocation: location.label,
                destinationLatitude: location.latitude,
                destinationLongitude: location.longitude,
                destinationPlaceId: location.placeId,
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
