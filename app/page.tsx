import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { ROLE_DASHBOARD_PATHS } from "@/lib/navigation";

const platformMetrics = [
  {
    label: "Roles",
    value: "3",
    description: "Clients, creatives, and collaborators"
  },
  {
    label: "Core Layers",
    value: "6",
    description: "Projects, contracts, invoices, bookings, listings, EOI"
  },
  {
    label: "Security Model",
    value: "Zero Trust",
    description: "RBAC-first architecture from the foundation"
  }
] as const;

export default async function HomePage() {
  const session = await getAuthenticatedSession();

  if (session !== null) {
    redirect(ROLE_DASHBOARD_PATHS[session.role]);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <section className="maurie-glass grid w-full max-w-6xl gap-10 rounded-[2rem] p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
        <div className="flex flex-col justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(89,55,50,0.16)] bg-[linear-gradient(135deg,var(--maurie-yellow),var(--maurie-orange))] text-base font-black tracking-tight text-[var(--maurie-black)] shadow-[0_14px_34px_rgba(234,109,48,0.24)]">
            ME
          </div>

          <p className="mt-8 text-sm font-medium uppercase tracking-[0.3em] text-[var(--maurie-muted)]">
            Mauri-E Platform
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[0.96] tracking-tight text-[var(--maurie-text)] sm:text-6xl">
            The operating system for purpose-driven businesses, creators, and collaborators.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--maurie-muted)] sm:text-lg">
            Mauri-E brings project delivery, contracts, invoices, creative portfolios, campaign
            rooms, business listings, and film investment workflows into one secure digital
            ecosystem.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="maurie-button-primary">
              Sign in securely
            </Link>

            <Link href="/login" className="maurie-button-secondary">
              View demo access
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--maurie-border)] bg-[var(--maurie-black)] p-5 text-[var(--maurie-cream)] shadow-[0_24px_80px_rgba(89,55,50,0.22)]">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/60">
              Foundation Status
            </p>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Authentication foundation active.
            </h2>

            <p className="mt-4 text-sm leading-6 text-white/70">
              The platform now supports secure seeded users, password verification, HttpOnly
              sessions, and role-aware dashboard routing.
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            {platformMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-white/60">{metric.label}</p>
                  <p className="text-sm font-semibold text-white">{metric.value}</p>
                </div>
                <p className="mt-2 text-xs leading-5 text-white/60">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
