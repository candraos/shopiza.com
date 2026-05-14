import { VerificationForm } from "@/components/forms/verification-form";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const { userId } = await searchParams;

  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-3xl glass-card rounded-[40px] p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Verification
        </p>
        <h1 className="mt-3 display-title text-4xl font-semibold text-[var(--navy-950)]">
          Verify your email and phone
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-700)]">
          Enter the codes sent during registration. In development, codes are also logged safely in the server output.
        </p>
        <div className="mt-8">
          {userId ? (
            <VerificationForm userId={userId} />
          ) : (
            <p className="rounded-2xl bg-[rgba(214,47,85,0.08)] px-4 py-3 text-sm text-[var(--danger-500)]">
              Missing user verification reference. Register first to receive verification codes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
