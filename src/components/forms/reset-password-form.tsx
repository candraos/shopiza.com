'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/ui/field";

export function ResetPasswordForm({
  initialIdentifier,
  initialChannel,
}: {
  initialIdentifier?: string;
  initialChannel?: string;
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
        const payload = Object.fromEntries(formData.entries());
        const response = await fetch("/api/auth/password/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await response.json()) as { message?: string };

        if (!response.ok) {
          toast.error(data.message ?? "Password reset failed.");
          setPending(false);
          return;
        }

        toast.success("Password changed successfully.");
        router.push("/login");
      }}
    >
      <TextField
        label="Identifier"
        name="identifier"
        defaultValue={initialIdentifier ?? ""}
      />
      <SelectField
        label="Verification channel"
        name="channel"
        defaultValue={initialChannel ?? "EMAIL"}
      >
        <option value="EMAIL">Email</option>
        <option value="SMS">SMS</option>
      </SelectField>
      <TextField label="Verification code" name="code" maxLength={6} />
      <TextField label="New password" name="newPassword" type="password" />
      <TextField
        label="Confirm new password"
        name="confirmNewPassword"
        type="password"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
