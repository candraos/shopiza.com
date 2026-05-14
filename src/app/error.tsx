'use client';

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-shell py-12">
      <div className="glass-card rounded-[36px] p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--danger-500)]">
          Unexpected error
        </p>
        <h1 className="mt-3 display-title text-4xl font-semibold text-[var(--navy-950)]">
          Something went wrong
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[var(--ink-700)]">
          The page could not finish loading. Try the action again or return to the storefront.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button type="button" onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
