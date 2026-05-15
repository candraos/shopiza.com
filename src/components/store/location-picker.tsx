'use client';

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google?: {
      maps?: {
        Map: new (
          element: HTMLElement,
          options: {
            center: { lat: number; lng: number };
            zoom: number;
            disableDefaultUI?: boolean;
            zoomControl?: boolean;
            clickableIcons?: boolean;
            gestureHandling?: string;
          },
        ) => GoogleMapInstance;
        Marker: new (options: {
          map: GoogleMapInstance;
          position: { lat: number; lng: number };
        }) => GoogleMarkerInstance;
        Geocoder: new () => GoogleGeocoderInstance;
        places?: {
          Autocomplete: new (
            input: HTMLInputElement,
            options: { fields: string[] },
          ) => GoogleAutocompleteInstance;
        };
      };
    };
  }
}

type GoogleMapInstance = {
  setCenter: (position: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  addListener: (eventName: string, listener: (event?: GoogleMapClickEvent) => void) => void;
};

type GoogleMarkerInstance = {
  setMap: (map: GoogleMapInstance | null) => void;
  setPosition: (position: { lat: number; lng: number }) => void;
};

type GoogleAutocompleteInstance = {
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

type GoogleGeocoderInstance = {
  geocode: (
    request:
      | { location: { lat: number; lng: number } }
      | { placeId: string },
    callback: (
      results: Array<{
        formatted_address?: string;
        geometry?: {
          location?: {
            lat: () => number;
            lng: () => number;
          };
        };
        place_id?: string;
      }> | null,
      status: string,
    ) => void,
  ) => void;
};

type GoogleMapClickEvent = {
  latLng?: {
    lat: () => number;
    lng: () => number;
  };
};

type LocationValue = {
  label: string;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
};

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const defaultMapCenter = { lat: 33.8938, lng: 35.5018 };
let googleMapsScriptPromise: Promise<void> | null = null;

function loadGoogleMapsScript() {
  if (!apiKey) {
    return Promise.reject(new Error("Google Maps is not configured."));
  }

  if (window.google?.maps?.Map && window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Could not load Google Maps.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Google Maps."));
    document.body.appendChild(script);
  });

  return googleMapsScriptPromise;
}

function reverseGeocode(
  geocoder: GoogleGeocoderInstance,
  position: { lat: number; lng: number },
) {
  return new Promise<{
    label: string;
    placeId: string | null;
  }>((resolve, reject) => {
    geocoder.geocode({ location: position }, (results, status) => {
      if (status !== "OK" || !results?.[0]) {
        reject(new Error("Could not resolve that map location."));
        return;
      }

      resolve({
        label:
          results[0].formatted_address ??
          `Pinned location (${position.lat.toFixed(5)}, ${position.lng.toFixed(5)})`,
        placeId: results[0].place_id ?? null,
      });
    });
  });
}

export function LocationPicker({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const markerRef = useRef<GoogleMarkerInstance | null>(null);
  const geocoderRef = useRef<GoogleGeocoderInstance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBootingMap, setIsBootingMap] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [draftLocation, setDraftLocation] = useState<LocationValue>(value);

  useEffect(() => {
    if (isModalOpen && searchInputRef.current) {
      searchInputRef.current.value = draftLocation.label;
    }
  }, [draftLocation.label, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    if (!apiKey) {
      return;
    }

    let disposed = false;

    const applySelection = (nextValue: LocationValue, shouldCenterMap = true) => {
      if (disposed) {
        return;
      }

      setDraftLocation(nextValue);

      if (markerRef.current && nextValue.latitude !== null && nextValue.longitude !== null) {
        markerRef.current.setPosition({
          lat: nextValue.latitude,
          lng: nextValue.longitude,
        });
      }

      if (
        shouldCenterMap &&
        mapRef.current &&
        nextValue.latitude !== null &&
        nextValue.longitude !== null
      ) {
        mapRef.current.setCenter({
          lat: nextValue.latitude,
          lng: nextValue.longitude,
        });
        mapRef.current.setZoom(16);
      }
    };

    const resolveCoordinatesSelection = async (
      position: { lat: number; lng: number },
      fallbackLabel?: string,
    ) => {
      if (!geocoderRef.current) {
        return;
      }

      try {
        const geocoded = await reverseGeocode(geocoderRef.current, position);
        applySelection({
          label: geocoded.label,
          latitude: position.lat,
          longitude: position.lng,
          placeId: geocoded.placeId,
        });
      } catch {
        applySelection({
          label:
            fallbackLabel ??
            `Pinned location (${position.lat.toFixed(5)}, ${position.lng.toFixed(5)})`,
          latitude: position.lat,
          longitude: position.lng,
          placeId: null,
        });
      }
    };

    const initializeMap = async () => {
      setIsBootingMap(true);
      setMapError(null);

      try {
        await loadGoogleMapsScript();

        if (
          disposed ||
          !mapElementRef.current ||
          !searchInputRef.current ||
          !window.google?.maps?.Map ||
          !window.google.maps.Marker ||
          !window.google.maps.Geocoder ||
          !window.google.maps.places?.Autocomplete
        ) {
          return;
        }

        const fallbackPosition =
          value.latitude !== null && value.longitude !== null
            ? { lat: value.latitude, lng: value.longitude }
            : defaultMapCenter;

        mapRef.current = new window.google.maps.Map(mapElementRef.current, {
          center: fallbackPosition,
          zoom:
            value.latitude !== null && value.longitude !== null ? 16 : 12,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: "greedy",
        });
        markerRef.current = new window.google.maps.Marker({
          map: mapRef.current,
          position: fallbackPosition,
        });
        geocoderRef.current = new window.google.maps.Geocoder();

        mapRef.current.addListener("click", (event) => {
          const clickedPosition = event?.latLng;
          if (!clickedPosition) {
            return;
          }

          void resolveCoordinatesSelection({
            lat: clickedPosition.lat(),
            lng: clickedPosition.lng(),
          });
        });

        const autocomplete = new window.google.maps.places.Autocomplete(
          searchInputRef.current,
          {
            fields: ["formatted_address", "geometry", "place_id"],
          },
        );

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const latitude = place.geometry?.location?.lat() ?? null;
          const longitude = place.geometry?.location?.lng() ?? null;

          if (latitude === null || longitude === null) {
            return;
          }

          applySelection({
            label:
              place.formatted_address ??
              searchInputRef.current?.value ??
              "Selected location",
            latitude,
            longitude,
            placeId: place.place_id ?? null,
          });
        });

        if (value.latitude !== null && value.longitude !== null) {
          applySelection(value, false);
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setIsLocating(false);
            void resolveCoordinatesSelection(
              {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
              "Current location",
            );
          },
          () => {
            setIsLocating(false);
            if (value.latitude !== null && value.longitude !== null) {
              applySelection(value, false);
              return;
            }

            applySelection({
              label: "",
              latitude: fallbackPosition.lat,
              longitude: fallbackPosition.lng,
              placeId: null,
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
          },
        );
      } catch (error) {
        setMapError(
          error instanceof Error
            ? error.message
            : "Could not open Google Maps.",
        );
      } finally {
        if (!disposed) {
          setIsBootingMap(false);
        }
      }
    };

    void initializeMap();

    return () => {
      disposed = true;
    };
  }, [isModalOpen, onChange, value]);

  const canConfirm =
    draftLocation.label &&
    draftLocation.latitude !== null &&
    draftLocation.longitude !== null;

  return (
    <>
      <div className="space-y-4 rounded-[28px] border border-[var(--line-soft)] bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--navy-950)]">
              Delivery location
            </p>
            <p className="text-sm leading-7 text-[var(--ink-700)]">
              Pick a destination in Google Maps for this order. We start from your
              current location by default, and you can switch to any other point.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0"
            onClick={() => {
              setDraftLocation(value);
              setMapError(null);
              setIsModalOpen(true);
            }}
          >
            <MapPin className="mr-2 h-4 w-4" />
            {value.label ? "Change location" : "Choose location"}
          </Button>
        </div>

        {value.label ? (
          <div className="rounded-[24px] border border-[rgba(244,71,161,0.14)] bg-[rgba(244,71,161,0.05)] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--pink-500)]">
              Selected destination
            </p>
            <p className="mt-2 text-sm font-medium text-[var(--navy-950)]">
              {value.label}
            </p>
          </div>
        ) : (
          <p className="rounded-[24px] border border-dashed border-[var(--line-soft)] px-4 py-4 text-sm text-[var(--ink-700)]">
            No destination selected yet.
          </p>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(11,16,34,0.58)] p-4">
          <div className="glass-card relative w-full max-w-5xl rounded-[34px] p-5 md:p-7">
            <button
              type="button"
              aria-label="Close location chooser"
              className="absolute right-4 top-4 rounded-full border border-[var(--line-soft)] bg-white p-2 text-[var(--navy-950)]"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col gap-6">
              <div className="pr-12">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
                  Choose location
                </p>
                <h2 className="mt-3 display-title text-3xl font-semibold text-[var(--navy-950)]">
                  Select a delivery point on Google Maps
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-700)]">
                  We open on your current position when available. Search for an
                  address, use your current location, or click directly on the map.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
                <div className="space-y-4">
                  <label className="flex flex-col gap-2 text-sm font-medium text-[var(--navy-950)]">
                    <span>Search in Google Maps</span>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-[var(--ink-500)]" />
                      <input
                        ref={searchInputRef}
                        defaultValue={draftLocation.label}
                        className="w-full rounded-2xl border border-[var(--line-soft)] bg-white py-3 pl-11 pr-4 text-sm shadow-[0_8px_18px_rgba(17,24,39,0.04)] outline-none focus:border-[rgba(244,71,161,0.45)]"
                        placeholder={
                          apiKey
                            ? "Search for a place or address"
                            : "Google Maps is not configured"
                        }
                        disabled={!apiKey}
                      />
                    </div>
                  </label>

                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    disabled={isLocating || !apiKey}
                    onClick={() => {
                      if (!mapRef.current || !geocoderRef.current) {
                        return;
                      }

                      setIsLocating(true);
                      navigator.geolocation.getCurrentPosition(
                        async (position) => {
                          const nextPosition = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                          };

                          markerRef.current?.setPosition(nextPosition);
                          mapRef.current?.setCenter(nextPosition);
                          mapRef.current?.setZoom(16);

                          try {
                            const geocoded = await reverseGeocode(
                              geocoderRef.current as GoogleGeocoderInstance,
                              nextPosition,
                            );
                            setDraftLocation({
                              label: geocoded.label,
                              latitude: nextPosition.lat,
                              longitude: nextPosition.lng,
                              placeId: geocoded.placeId,
                            });
                          } catch {
                            setDraftLocation({
                              label: "Current location",
                              latitude: nextPosition.lat,
                              longitude: nextPosition.lng,
                              placeId: null,
                            });
                          } finally {
                            setIsLocating(false);
                          }
                        },
                        () => {
                          setIsLocating(false);
                          setMapError("Could not read your current location.");
                        },
                        {
                          enableHighAccuracy: true,
                          timeout: 10000,
                        },
                      );
                    }}
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    {isLocating ? "Locating..." : "Use current location"}
                  </Button>

                  <div className="rounded-[24px] border border-[var(--line-soft)] bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--pink-500)]">
                      Pending selection
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--navy-950)]">
                      {draftLocation.label || "Choose a point on the map"}
                    </p>
                    {draftLocation.latitude !== null && draftLocation.longitude !== null ? (
                      <p className="mt-2 text-xs text-[var(--ink-500)]">
                        {draftLocation.latitude.toFixed(5)}, {draftLocation.longitude.toFixed(5)}
                      </p>
                    ) : null}
                  </div>

                  {mapError ? (
                    <p className="rounded-2xl bg-[rgba(214,47,85,0.08)] px-4 py-3 text-sm text-[var(--danger-500)]">
                      {mapError}
                    </p>
                  ) : !apiKey ? (
                    <p className="rounded-2xl bg-[rgba(214,47,85,0.08)] px-4 py-3 text-sm text-[var(--danger-500)]">
                      Google Maps is not configured for this app.
                    </p>
                  ) : null}
                </div>

                <div className="overflow-hidden rounded-[28px] border border-[var(--line-soft)] bg-[rgba(19,24,47,0.04)]">
                  <div
                    ref={mapElementRef}
                    className="h-[420px] w-full md:h-[520px]"
                  />
                  {isBootingMap ? (
                    <div className="flex items-center justify-center border-t border-[var(--line-soft)] px-4 py-3 text-sm text-[var(--ink-700)]">
                      Loading Google Maps...
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!canConfirm}
                  onClick={() => {
                    onChange(draftLocation);
                    setIsModalOpen(false);
                  }}
                >
                  Confirm location
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
