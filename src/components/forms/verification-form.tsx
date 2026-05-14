'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button, ButtonLink } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";

export function VerificationForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [pendingChannel, setPendingChannel] = useState<"EMAIL" | "SMS" | null>(null);
  const [completed, setCompleted] = useState<Record<"EMAIL" | "SMS", boolean>>({
    EMAIL: false,
    SMS: false,
  });

  const submitCode = async (channel: "EMAIL" | "SMS", code: string) => {
    setPendingChannel(channel);
    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, channel, code }),
    });
    const data = (await response.json()) as { message?: string; fullyVerified?: boolean };

    if (!response.ok) {
      toast.error(data.message ?? "Verification failed.");
      setPendingChannel(null);
      return;
    }

    toast.success(`${channel === "EMAIL" ? "Email" : "Phone"} verified.`);
    setCompleted((current) => ({ ...current, [channel]: true }));
    setPendingChannel(null);

    if (data.fullyVerified) {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div className="grid gap-5">
      {(["EMAIL", "SMS"] as const).map((channel) => (
        <form
          key={channel}
          className="rounded-[30px] border border-[var(--line-soft)] bg-white p-5"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const code = String(formData.get("code") ?? "");
            await submitCode(channel, code);
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="display-title text-2xl font-semibold text-[var(--navy-950)]">
                {channel === "EMAIL" ? "Email verification" : "Phone verification"}
              </p>
              <p className="mt-2 text-sm text-[var(--ink-700)]">
                Enter the 6-digit code sent to your{" "}
                {channel === "EMAIL" ? "email inbox" : "phone"}.
              </p>
            </div>
            {completed[channel] ? (
              <span className="rounded-full bg-[rgba(31,157,109,0.12)] px-3 py-1 text-xs font-semibold text-[var(--success-500)]">
                Verified
              </span>
            ) : null}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <TextField
                name="code"
                placeholder="Enter code"
                maxLength={6}
                inputMode="numeric"
              />
            </div>
            <Button type="submit" disabled={pendingChannel === channel}>
              {pendingChannel === channel ? "Checking..." : "Verify"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={pendingChannel === channel}
              onClick={async () => {
                setPendingChannel(channel);
                const response = await fetch("/api/auth/verify", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId, channel }),
                });
                const data = (await response.json()) as { message?: string };
                if (!response.ok) {
                  toast.error(data.message ?? "Could not resend the code.");
                  setPendingChannel(null);
                  return;
                }
                toast.success(data.message ?? "Verification code resent.");
                setPendingChannel(null);
              }}
            >
              Resend
            </Button>
          </div>
        </form>
      ))}
      <ButtonLink href="/login" variant="ghost">
        Back to login
      </ButtonLink>
    </div>
  );
}
