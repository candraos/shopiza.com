import { requireAdmin } from "@/lib/auth/current-user";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="container-shell grid gap-8 py-10 lg:grid-cols-[280px_1fr]">
      <aside className="glass-card h-fit rounded-[32px] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Admin dashboard
        </p>
        <h2 className="mt-3 display-title text-3xl font-semibold text-[var(--navy-950)]">
          Manage Shopiza
        </h2>
        <div className="mt-6">
          <AdminNav />
        </div>
      </aside>
      <section>{children}</section>
    </div>
  );
}
