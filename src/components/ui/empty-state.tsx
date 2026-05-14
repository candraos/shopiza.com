import { ButtonLink } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="glass-card rounded-[32px] p-10 text-center animate-float-up">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[rgba(244,71,161,0.08)] text-xl font-bold text-[var(--pink-500)]">
        ?
      </div>
      <h3 className="display-title text-2xl font-semibold text-[var(--navy-950)]">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--ink-700)]">
        {description}
      </p>
      {ctaLabel && ctaHref ? (
        <div className="mt-6">
          <ButtonLink href={ctaHref}>{ctaLabel}</ButtonLink>
        </div>
      ) : null}
    </div>
  );
}
