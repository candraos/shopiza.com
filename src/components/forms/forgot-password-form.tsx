'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);

        const formData = new FormData(event.currentTarget);
        const payload = Object.fromEntries(formData.entries());
        const response = await fetch("/api/auth/password/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = (await response.json()) as { message?: string };
        if (!response.ok) {
          toast.error(data.message ?? "Could not request a reset code.");
          setPending(false);
          return;
        }

        toast.success(data.message ?? "Reset code sent.");
        router.push(
          `/reset-password?email=${encodeURIComponent(String(payload.email ?? ""))}`,
        );
      }}
    >
      <TextField
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send reset code"}
      </Button>
    </form>
  );
}
