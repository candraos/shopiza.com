import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-xl glass-card rounded-[40px] p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Password reset
        </p>
        <h1 className="mt-3 display-title text-4xl font-semibold text-[var(--navy-950)]">
          Request a reset code
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-700)]">
          Choose email or SMS verification to change your password securely.
        </p>
        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
