'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [locationLabel, setLocationLabel] = useState("");
  const [locationLatitude, setLocationLatitude] = useState<number | null>(null);
  const [locationLongitude, setLocationLongitude] = useState<number | null>(null);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setErrors({});

        const formData = new FormData(event.currentTarget);
        const payload = {
          fullName: String(formData.get("fullName") ?? ""),
          username: String(formData.get("username") ?? ""),
          email: String(formData.get("email") ?? ""),
          phoneNumber: String(formData.get("phoneNumber") ?? ""),
          password: String(formData.get("password") ?? ""),
          confirmPassword: String(formData.get("confirmPassword") ?? ""),
          locationAccessGranted: Boolean(locationLabel),
          locationLabel,
          locationLatitude,
          locationLongitude,
        };

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = (await response.json()) as {
          userId?: string;
          message?: string;
          errors?: Record<string, string[]>;
        };

        if (!response.ok) {
          setErrors(data.errors ?? {});
          toast.error(data.message ?? "Could not create your account.");
          setPending(false);
          return;
        }

        toast.success("Account created. Verify your email and phone next.");
        router.push(`/verify?userId=${data.userId}`);
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <TextField label="Full name" name="fullName" placeholder="Your name" />
          {errors.fullName ? (
            <p className="mt-2 text-xs text-[var(--danger-500)]">{errors.fullName[0]}</p>
          ) : null}
        </div>
        <div>
          <TextField label="Username" name="username" placeholder="your_username" />
          {errors.username ? (
            <p className="mt-2 text-xs text-[var(--danger-500)]">{errors.username[0]}</p>
          ) : null}
        </div>
        <div>
          <TextField label="Email" name="email" type="email" placeholder="you@example.com" />
          {errors.email ? (
            <p className="mt-2 text-xs text-[var(--danger-500)]">{errors.email[0]}</p>
          ) : null}
        </div>
        <div>
          <TextField label="Phone number" name="phoneNumber" placeholder="+961..." />
          {errors.phoneNumber ? (
            <p className="mt-2 text-xs text-[var(--danger-500)]">{errors.phoneNumber[0]}</p>
          ) : null}
        </div>
        <div>
          <TextField label="Password" name="password" type="password" />
          {errors.password ? (
            <p className="mt-2 text-xs text-[var(--danger-500)]">{errors.password[0]}</p>
          ) : null}
        </div>
        <div>
          <TextField label="Confirm password" name="confirmPassword" type="password" />
          {errors.confirmPassword ? (
            <p className="mt-2 text-xs text-[var(--danger-500)]">{errors.confirmPassword[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--line-soft)] bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--navy-950)]">
              Optional saved location
            </p>
            <p className="mt-1 text-sm text-[var(--ink-700)]">
              Grant location access now to speed up future checkout destinations.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] px-4 py-2 text-sm font-semibold text-[var(--navy-950)] hover:border-[rgba(244,71,161,0.35)]"
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  setLocationLatitude(latitude);
                  setLocationLongitude(longitude);
                  setLocationLabel(
                    `Current location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
                  );
                  toast.success("Location captured.");
                },
                () => {
                  toast.error("Location access was not granted.");
                },
              );
            }}
          >
            <MapPin className="h-4 w-4" />
            Use current location
          </button>
        </div>
        {locationLabel ? (
          <p className="mt-4 rounded-2xl bg-[rgba(244,71,161,0.06)] px-4 py-3 text-sm text-[var(--navy-950)]">
            Saved location: {locationLabel}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
