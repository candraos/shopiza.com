import { SectionsManager } from "@/components/admin/sections-manager";
import { getAdminSections } from "@/lib/services/admin";

export default async function AdminSectionsPage() {
  const sections = await getAdminSections();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Catalog
        </p>
        <h1 className="mt-2 display-title text-4xl font-semibold text-[var(--navy-950)]">
          Manage sections
        </h1>
      </div>
      <SectionsManager sections={sections} />
    </div>
  );
}
