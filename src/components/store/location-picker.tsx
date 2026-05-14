'use client';

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (
            input: HTMLInputElement,
            options: { fields: string[] },
          ) => {
            addListener: (eventName: string, listener: () => void) => void;
            getPlace: () => {
              formatted_address?: string;
              geometry?: {
                location?: {
                  lat: () => number;
                  lng: () => number;
                };
              };
              place_id?: string;
            };
          };
        };
      };
    };
  }
}

type LocationValue = {
  label: string;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
};

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function LocationPicker({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!apiKey || !inputRef.current) {
      return;
    }

    const initializeAutocomplete = () => {
      if (!window.google?.maps?.places || !inputRef.current) {
        return;
      }

      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          fields: ["formatted_address", "geometry", "place_id"],
        },
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        onChange({
          label: place.formatted_address ?? inputRef.current?.value ?? "",
          latitude: place.geometry?.location?.lat() ?? null,
          longitude: place.geometry?.location?.lng() ?? null,
          placeId: place.place_id ?? null,
        });
      });
    };

    if (window.google?.maps?.places) {
      initializeAutocomplete();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = initializeAutocomplete;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [onChange]);

  return (
    <div className="space-y-4 rounded-[28px] border border-[var(--line-soft)] bg-white p-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                onChange({
                  label: `Current location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
                  latitude,
                  longitude,
                  placeId: null,
                });
                setIsLocating(false);
              },
              () => setIsLocating(false),
            );
          }}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] px-4 py-2 text-sm font-semibold text-[var(--navy-950)] hover:border-[rgba(244,71,161,0.35)]"
        >
          <Navigation className="h-4 w-4" />
          {isLocating ? "Locating..." : "Use current location"}
        </button>
        <span className="text-xs uppercase tracking-[0.28em] text-[var(--ink-500)]">
          or choose another destination
        </span>
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-[var(--navy-950)]">
        <span>Google Maps / address</span>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-[var(--ink-500)]" />
          <input
            ref={inputRef}
            value={value.label}
            onChange={(event) =>
              onChange({
                ...value,
                label: event.target.value,
              })
            }
            className="w-full rounded-2xl border border-[var(--line-soft)] bg-white py-3 pl-11 pr-4 text-sm shadow-[0_8px_18px_rgba(17,24,39,0.04)] outline-none focus:border-[rgba(244,71,161,0.45)]"
            placeholder={
              apiKey
                ? "Search for a place or address"
                : "Enter a detailed delivery location"
            }
          />
        </div>
      </label>
    </div>
  );
}
