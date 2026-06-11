'use client';

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useRef } from "react";

type ProductsFiltersProps = {
  initialQuery?: string;
  initialSection?: string;
  sections: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
};

export function ProductsFilters({
  initialQuery,
  initialSection,
  sections,
}: ProductsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const queryInputRef = useRef<HTMLInputElement>(null);
  const sectionSelectRef = useRef<HTMLSelectElement>(null);
  const debounceTimeoutRef = useRef<number | null>(null);

  function updateFilters() {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const formData = new FormData(form);
    const nextQuery = String(formData.get("q") ?? "").trim();
    const nextSection = String(formData.get("section") ?? "");
    const params = new URLSearchParams(searchParams.toString());

    if (nextQuery) {
      params.set("q", nextQuery);
    } else {
      params.delete("q");
    }

    if (nextSection) {
      params.set("section", nextSection);
    } else {
      params.delete("section");
    }

    const nextUrl = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    const currentUrl =
      searchParams.size > 0 ? `${pathname}?${searchParams.toString()}` : pathname;

    if (nextUrl === currentUrl) {
      return;
    }

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }

  function scheduleFilterUpdate() {
    if (debounceTimeoutRef.current !== null) {
      window.clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      updateFilters();
    }, 250);
  }

  useEffect(() => {
    if (queryInputRef.current) {
      queryInputRef.current.value = initialQuery ?? "";
    }

    if (sectionSelectRef.current) {
      sectionSelectRef.current.value = initialSection ?? "";
    }
  }, [initialQuery, initialSection]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current !== null) {
        window.clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form
      ref={formRef}
      className="mt-8 grid gap-4 md:grid-cols-[1fr_160px]"
      onSubmit={(event) => {
        event.preventDefault();
        updateFilters();
      }}
    >
      <input
        ref={queryInputRef}
        type="search"
        name="q"
        defaultValue={initialQuery}
        onChange={scheduleFilterUpdate}
        placeholder="Search for laptops, speakers, lighting, and more"
        className="w-full rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-3 text-sm shadow-[0_10px_18px_rgba(17,24,39,0.04)] outline-none focus:border-[rgba(244,71,161,0.45)]"
      />
      <select
        ref={sectionSelectRef}
        name="section"
        defaultValue={initialSection ?? ""}
        onChange={scheduleFilterUpdate}
        className="rounded-2xl border border-[var(--line-soft)] bg-white px-3 py-2 text-sm shadow-[0_10px_18px_rgba(17,24,39,0.04)] outline-none focus:border-[rgba(244,71,161,0.45)]"
      >
        <option value="">All sections</option>
        {sections.map((sectionItem) => (
          <option key={sectionItem.id} value={sectionItem.slug}>
            {sectionItem.name}
          </option>
        ))}
      </select>
    </form>
  );
}
