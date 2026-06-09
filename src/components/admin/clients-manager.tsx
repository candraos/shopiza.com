'use client';

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";

type ClientItem = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  createdAt: Date;
};

export function ClientsManager({ clients }: { clients: ClientItem[] }) {
  const router = useRouter();

  if (clients.length === 0) {
    return (
      <EmptyState
        title="No clients found"
        description="No client accounts have completed registration yet."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {clients.map((client) => (
        <article key={client.id} className="glass-card rounded-[32px] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--pink-500)]">
                {client.username}
              </p>
              <h2 className="mt-2 display-title text-2xl font-semibold text-[var(--navy-950)]">
                {client.fullName}
              </h2>
              <p className="mt-2 text-sm text-[var(--ink-700)]">{client.email}</p>
              <p className="mt-1 text-sm text-[var(--ink-700)]">{client.phoneNumber}</p>
            </div>
            <p className="text-sm font-medium text-[var(--ink-500)]">
              Registered {formatDateTime(client.createdAt)}
            </p>
            <Button
              type="button"
              variant="danger"
              onClick={async () => {
                const confirmed = window.confirm(
                  `Delete ${client.fullName}'s account permanently?`,
                );

                if (!confirmed) {
                  return;
                }

                const response = await fetch(`/api/admin/clients/${client.id}`, {
                  method: "DELETE",
                });
                const data = (await response.json()) as { message?: string };

                if (!response.ok) {
                  toast.error(data.message ?? "Could not delete the client account.");
                  return;
                }

                toast.success("Client account deleted.");
                router.refresh();
              }}
            >
              Delete account
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
