'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="danger"
      disabled={pending}
      onClick={async () => {
        const confirmed = window.confirm(
          "Delete your account permanently? Your profile access will be removed immediately.",
        );

        if (!confirmed) {
          return;
        }

        setPending(true);

        try {
          const response = await fetch("/api/account", {
            method: "DELETE",
          });
          const data = (await response.json()) as { message?: string };

          if (!response.ok) {
            toast.error(data.message ?? "Could not delete your account.");
            setPending(false);
            return;
          }

          toast.success("Your account was deleted.");
          router.push("/");
          router.refresh();
        } catch {
          toast.error("Could not delete your account.");
          setPending(false);
        }
      }}
    >
      {pending ? "Deleting account..." : "Delete account"}
    </Button>
  );
}
