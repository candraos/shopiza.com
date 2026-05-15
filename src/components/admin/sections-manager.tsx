'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/field";

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
  const [editing, setEditing] = useState<SectionItem | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="glass-card rounded-[32px] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Sections
        </p>
        <div className="mt-5 grid gap-3">
          {sections.map((section) => (
            <article
              key={section.id}
              className="rounded-[24px] border border-[var(--line-soft)] bg-white p-4"
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
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEditing(section)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
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
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <form
        className="glass-card rounded-[32px] p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          const form = event.currentTarget;
          const formData = new FormData(form);
          const payload = {
            name: String(formData.get("name") ?? ""),
            description: String(formData.get("description") ?? ""),
          };

          const response = await fetch(
            editing ? `/api/admin/sections/${editing.id}` : "/api/admin/sections",
            {
              method: editing ? "PUT" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            },
          );

          const data = (await response.json()) as { message?: string };
          if (!response.ok) {
            toast.error(data.message ?? "Could not save the section.");
            setPending(false);
            return;
          }

          toast.success(editing ? "Section updated." : "Section created.");
          setEditing(null);
          form.reset();
          router.refresh();
          setPending(false);
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          {editing ? "Edit section" : "Add section"}
        </p>
        <div className="mt-6 grid gap-4">
          <TextField
            label="Section name"
            name="name"
            defaultValue={editing?.name}
            key={editing?.id ? `${editing.id}-name` : "new-name"}
          />
          <TextAreaField
            label="Description"
            name="description"
            defaultValue={editing?.description}
            key={editing?.id ? `${editing.id}-description` : "new-description"}
          />
          <div className="flex gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : editing ? "Update section" : "Create section"}
            </Button>
            {editing ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}
