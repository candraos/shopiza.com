import { ResetPasswordCodeForm } from "@/components/forms/reset-password-form";
import { redirectAdminHome } from "@/lib/auth/current-user";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string;
  }>;
}) {
  await redirectAdminHome();

  const params = await searchParams;

  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-xl glass-card rounded-[40px] p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Password reset
        </p>
        <h1 className="mt-3 display-title text-4xl font-semibold text-[var(--navy-950)]">
          Enter your verification code
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-700)]">
          Check your email, then enter the 6-digit code on this page before continuing.
        </p>
        <div className="mt-8">
          <ResetPasswordCodeForm initialEmail={params.email} />
        </div>
      </div>
    </div>
  );
}
