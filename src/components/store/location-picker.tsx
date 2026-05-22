'use client';

import { Home } from "lucide-react";

import { TextField } from "@/components/ui/field";

export type LocationValue = {
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
};

export function buildLocationLabel(value: LocationValue) {
  return [
    `Building ${value.buildingNumber.trim()}`,
    value.street.trim(),
    value.district.trim(),
    value.city.trim(),
  ]
    .filter(Boolean)
    .join(", ");
}

export function isLocationComplete(value: LocationValue) {
  return Boolean(
    value.city.trim() &&
      value.district.trim() &&
      value.street.trim() &&
      value.buildingNumber.trim(),
  );
}

export function LocationPicker({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
}) {
  const hasAddress = isLocationComplete(value);

  const updateField =
    (field: keyof LocationValue) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...value,
        [field]: event.currentTarget.value,
      });
    };

  return (
    <div className="space-y-4 rounded-[28px] border border-[var(--line-soft)] bg-white p-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-[var(--navy-950)]">
          Delivery address
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="City" value={value.city} onChange={updateField("city")} />
        <TextField label="District" value={value.district} onChange={updateField("district")} />
        <TextField label="Street" value={value.street} onChange={updateField("street")} />
        <TextField
          label="Building number"
          value={value.buildingNumber}
          onChange={updateField("buildingNumber")}
        />
      </div>

      {hasAddress ? (
        <div className="rounded-[24px] border border-[rgba(244,71,161,0.14)] bg-[rgba(244,71,161,0.05)] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--pink-500)]">
            Delivery summary
          </p>
          <p className="mt-2 flex items-start gap-2 text-sm font-medium text-[var(--navy-950)]">
            <Home className="mt-0.5 h-4 w-4 shrink-0 text-[var(--pink-500)]" />
            <span>{buildLocationLabel(value)}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
