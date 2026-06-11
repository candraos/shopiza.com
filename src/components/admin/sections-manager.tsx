'use client';

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ButtonLink } from "@/components/ui/button";

type SectionItem = {
  id: string;
  name: string;
  description: string;
  slug: string;
  _count: {
    products: number;
  };
};

export function SectionsManager({ sections }: { sections: SectionItem[] }) {
  const router = useRouter();

  if (sections.length === 0) {
    return (
      <div className="glass-card rounded-[32px] p-8 text-center">
        <p className="text-sm text-[var(--ink-700)]">No sections found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sections.map((section) => (
        <article
          key={section.id}
          className="glass-card rounded-[32px] p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="display-title text-2xl font-semibold text-[var(--navy-950)]">
                {section.name}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-700)]">
                {section.description}
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.28em] text-[var(--ink-500)]">
                {section._count.products} products
              </p>
            </div>
            <div className="flex gap-3">
              <ButtonLink href={`/admin/sections/${section.id}`} variant="secondary">
                Edit
              </ButtonLink>
              <button
                type="button"
                className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-400 transition hover:bg-red-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={async () => {
                  if (
                    !window.confirm(
                      "Delete this section? Its products will be moved to archived/unassigned.",
                    )
                  ) {
                    return;
                  }

                  const response = await fetch(`/api/admin/sections/${section.id}`, {
                    method: "DELETE",
                  });
                  const data = (await response.json()) as { message?: string };
                  if (!response.ok) {
                    toast.error(data.message ?? "Could not delete the section.");
                    return;
                  }
                  toast.success("Section deleted.");
                  router.refresh();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
