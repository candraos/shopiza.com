import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    identifier?: string;
    channel?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-xl glass-card rounded-[40px] p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Password reset
        </p>
        <h1 className="mt-3 display-title text-4xl font-semibold text-[var(--navy-950)]">
          Choose your new password
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-700)]">
          Enter the verification code, then choose a stronger password that differs from your old one.
        </p>
        <div className="mt-8">
          <ResetPasswordForm
            initialIdentifier={params.identifier}
            initialChannel={params.channel}
          />
        </div>
      </div>
    </div>
  );
}
