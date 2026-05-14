'use client';

import { useState } from "react";
import { toast } from "sonner";

import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { QuantityStepper } from "@/components/store/quantity-stepper";

export function QuantityPicker({
  productId,
  maxQuantity,
  disabled,
}: {
  productId: string;
  maxQuantity: number;
  disabled?: boolean;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <QuantityStepper
        value={quantity}
        min={1}
        max={Math.max(maxQuantity, 1)}
        onChange={(next) => {
          if (next > maxQuantity) {
            setQuantity(maxQuantity);
            toast.info(`Maximum available quantity is ${maxQuantity}.`);
            return;
          }

          setQuantity(next);
        }}
      />
      <AddToCartButton
        productId={productId}
        quantity={quantity}
        disabled={disabled}
      />
    </div>
  );
}
