import { redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="container-shell space-y-8 py-12">
      <div className="glass-card rounded-[32px] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          My profile
        </p>
        <h1 className="mt-3 display-title text-3xl font-semibold text-[var(--navy-950)] sm:text-4xl">
          Account details
        </h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-[var(--line-soft)] bg-white/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-500)]">Full name</p>
            <p className="mt-2 text-sm font-semibold text-[var(--navy-950)]">{user.fullName}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line-soft)] bg-white/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-500)]">Username</p>
            <p className="mt-2 text-sm font-semibold text-[var(--navy-950)]">{user.username}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line-soft)] bg-white/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-500)]">Email</p>
            <p className="mt-2 text-sm font-semibold text-[var(--navy-950)]">{user.email}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line-soft)] bg-white/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-500)]">Phone</p>
            <p className="mt-2 text-sm font-semibold text-[var(--navy-950)]">{user.phoneNumber}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/account/orders" variant="secondary">
            View orders
          </ButtonLink>
        </div>
      </div>

    </div>
  );
}
