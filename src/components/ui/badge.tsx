import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "discount" | "danger" | "success";
  className?: string;
}) {
  const toneClasses = {
    default: "bg-[rgba(19,24,47,0.06)] text-[var(--navy-950)]",
    discount: "bg-[rgba(244,71,161,0.12)] text-[var(--pink-500)]",
    danger: "bg-[rgba(214,47,85,0.12)] text-[var(--danger-500)]",
    success: "bg-[rgba(31,157,109,0.12)] text-[var(--success-500)]",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
