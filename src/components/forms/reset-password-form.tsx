'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";

export function ResetPasswordCodeForm({
  initialEmail,
}: {
  initialEmail?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);

        const formData = new FormData(event.currentTarget);
        const email = initialEmail?.trim() ?? "";
        const code = String(formData.get("code") ?? "").trim();
        router.push(
          `/reset-password/new?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`,
        );
      }}
    >
      <TextField label="Verification code" name="code" maxLength={6} />
      <Button type="submit" disabled={pending}>
        {pending ? "Continuing..." : "Continue"}
      </Button>
    </form>
  );
}

export function NewPasswordForm({
  email,
  code,
}: {
  email?: string;
  code?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setErrors({});

        const formData = new FormData(event.currentTarget);
        const payload = Object.fromEntries(formData.entries());
        const response = await fetch("/api/auth/password/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await response.json()) as {
          message?: string;
          errors?: Record<string, string[]>;
        };

        if (!response.ok) {
          setErrors(data.errors ?? {});
          toast.error(data.message ?? "Password reset failed.");
          setPending(false);
          return;
        }

        toast.success("Password changed successfully.");
        router.push("/login");
      }}
    >
      <input type="hidden" name="email" value={email ?? ""} />
      <input type="hidden" name="code" value={code ?? ""} />
      <div>
        <TextField label="New password" name="newPassword" type="password" />
        {errors.newPassword ? (
          <p className="mt-2 text-xs text-[var(--danger-500)]">{errors.newPassword[0]}</p>
        ) : null}
      </div>
      <div>
        <TextField
          label="Confirm new password"
          name="confirmNewPassword"
          type="password"
        />
        {errors.confirmNewPassword ? (
          <p className="mt-2 text-xs text-[var(--danger-500)]">{errors.confirmNewPassword[0]}</p>
        ) : null}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
