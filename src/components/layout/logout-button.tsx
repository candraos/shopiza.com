'use client';

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton({ onLogout }: { onLogout?: () => void }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        onLogout?.();

        const response = await fetch("/api/auth/logout", { method: "POST" });
        if (!response.ok) {
          toast.error("Could not log you out.");
          return;
        }

        toast.success("Logged out.");
        router.push("/");
        router.refresh();
      }}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] px-4 py-2 text-sm font-medium text-[var(--navy-950)] hover:border-[rgba(244,71,161,0.35)] hover:text-[var(--pink-500)]"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  );
}
