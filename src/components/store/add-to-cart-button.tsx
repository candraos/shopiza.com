'use client';

import { useState } from "react";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/components/store/cart-provider";

export function AddToCartButton({
  productId,
  disabled,
  quantity = 1,
  fullWidth = false,
}: {
  productId: string;
  disabled?: boolean;
  quantity?: number;
  fullWidth?: boolean;
}) {
  const { addItem, isMutating } = useCart();
  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      type="button"
      disabled={disabled || isMutating || isPending}
      className={fullWidth ? "w-full" : ""}
      onClick={async () => {
        setIsPending(true);
        await addItem(productId, quantity);
        setIsPending(false);
      }}
    >
      <ShoppingBag className="mr-2 h-4 w-4" />
      {disabled ? "Out of stock" : isPending ? "Adding..." : "Add to cart"}
    </Button>
  );
}
