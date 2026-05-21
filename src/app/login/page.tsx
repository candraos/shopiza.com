import { LoginForm } from "@/components/forms/login-form";
import { redirectAdminHome } from "@/lib/auth/current-user";

export default async function LoginPage() {
  await redirectAdminHome();

  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-xl glass-card rounded-[40px] p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Welcome back
        </p>
        <h1 className="mt-3 display-title text-4xl font-semibold text-[var(--navy-950)]">
          Login to continue
        </h1>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
