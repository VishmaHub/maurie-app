import { redirect } from "next/navigation";
import { LoginForm } from "@/app/login/login-form";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { ROLE_DASHBOARD_PATHS } from "@/lib/navigation";

interface LoginPageProps {
  readonly searchParams: Promise<{
    readonly error?: string;
    readonly next?: string;
  }>;
}

export default async function LoginPage(props: LoginPageProps) {
  const session = await getAuthenticatedSession();

  if (session !== null) {
    redirect(ROLE_DASHBOARD_PATHS[session.role]);
  }

  const searchParams = await props.searchParams;
  const hasInvalidLoginError: boolean = searchParams.error === "invalid-login";

  const nextPath: string =
    typeof searchParams.next === "string" && searchParams.next.startsWith("/dashboard")
      ? searchParams.next
      : "";

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <section className="maurie-glass w-full max-w-md rounded-[2rem] p-6 sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(89,55,50,0.16)] bg-[linear-gradient(135deg,var(--maurie-yellow),var(--maurie-orange))] text-base font-black tracking-tight text-[var(--maurie-black)] shadow-[0_14px_34px_rgba(234,109,48,0.24)]">
          ME
        </div>

        <p className="mt-8 text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
          Secure Access
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Sign in to Mauri-E.
        </h1>

        <p className="mt-4 text-sm leading-6 text-[var(--maurie-muted)]">
          Access your role-specific workspace for projects, creative tools, campaigns, and secure
          collaboration.
        </p>

        <LoginForm hasInvalidLoginError={hasInvalidLoginError} nextPath={nextPath} />

        <div className="mt-6 rounded-3xl border border-[var(--maurie-border)] bg-white/40 p-4 text-xs leading-5 text-[var(--maurie-muted)]">
          <p className="font-semibold text-[var(--maurie-text)]">Local demo accounts</p>
          <p className="mt-2">Client: client@maurie.local</p>
          <p>Creative: creative@maurie.local</p>
          <p>Collaborator: collaborator@maurie.local</p>
        </div>
      </section>
    </main>
  );
}
