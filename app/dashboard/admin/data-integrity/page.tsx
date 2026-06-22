import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminDataIntegrityData } from "@/lib/admin-data-integrity";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/formatters";

function getSeverityTone(severity: string): "yellow" | "orange" | "neutral" {
  if (severity === "PASS") {
    return "yellow";
  }

  if (severity === "WATCH" || severity === "ACTION") {
    return "orange";
  }

  return "neutral";
}

export default async function AdminDataIntegrityPage() {
  const session = await requireRole("ADMIN");

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminDataIntegrity",
    resourceId: "admin-data-integrity"
  });

  const data = await getAdminDataIntegrityData();

  const actionChecks = data.checks.filter((check): boolean => check.severity === "ACTION");
  const watchChecks = data.checks.filter((check): boolean => check.severity === "WATCH");
  const passChecks = data.checks.filter((check): boolean => check.severity === "PASS");

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Admin Data Integrity
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Data health review.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            Review incomplete records, missing metadata, empty states, billing gaps, listing
            readiness, campaign room setup, and secure EOI visibility across the Mauri-E platform.
          </p>
        </div>

        <Link href="/dashboard/admin" className="maurie-button-secondary">
          Back to Admin
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Checks</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {data.summary.totalChecks}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Pass</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {data.summary.pass}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Watch</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {data.summary.watch}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Action</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {data.summary.action}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Generated</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDateTime(data.generatedAt)}
          </p>
        </div>
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-6">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Priority review
        </h2>

        <div className="mt-5 grid gap-3">
          {actionChecks.length === 0 ? (
            <EmptyState
              title="No action-level data integrity issues found."
              description="The current data review did not identify critical admin data gaps. Continue monitoring watch-level checks before production launch."
            />
          ) : (
            actionChecks.map((check) => (
              <Link
                key={check.id}
                href={check.href}
                className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4 transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/55"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--maurie-text)]">{check.label}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                      {check.description}
                    </p>
                  </div>

                  <StatusBadge label={`${check.value} · ${check.severity}`} tone="orange" />
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-2">
        <div className="maurie-glass-soft rounded-3xl p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Watch-level checks
          </h2>

          <div className="mt-5 grid gap-3">
            {watchChecks.length === 0 ? (
              <EmptyState
                title="No watch-level issues found."
                description="The platform has no current watch-level checks to review."
              />
            ) : (
              watchChecks.map((check) => (
                <Link
                  key={check.id}
                  href={check.href}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4 transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/55"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--maurie-text)]">
                        {check.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                        {check.description}
                      </p>
                    </div>

                    <StatusBadge
                      label={`${check.value} · ${check.severity}`}
                      tone={getSeverityTone(check.severity)}
                    />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Passing checks
          </h2>

          <div className="mt-5 grid gap-3">
            {passChecks.map((check) => (
              <Link
                key={check.id}
                href={check.href}
                className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4 transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/55"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--maurie-text)]">{check.label}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                      {check.description}
                    </p>
                  </div>

                  <StatusBadge
                    label={`${check.value} · ${check.severity}`}
                    tone={getSeverityTone(check.severity)}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-6">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Empty state review
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
          Admin modules should remain useful even when no records exist. This review keeps empty
          state language consistent across the platform.
        </p>

        <div className="mt-5 grid gap-3">
          {data.emptyStateReview.map((item) => (
            <Link
              key={item.route}
              href={item.route}
              className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4 transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/55"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--maurie-text)]">{item.module}</p>
                  <p className="mt-1 text-xs text-[var(--maurie-muted)]">{item.route}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                    {item.recommendation}
                  </p>
                </div>

                <StatusBadge label={item.status} tone="yellow" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
