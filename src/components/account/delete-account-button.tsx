'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";


export function DeleteAccountButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-400 transition hover:bg-red-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
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
    </button>
  );
}
