import { AppShell } from "@/components/layout/app-shell";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { getCollaboratorDashboardData } from "@/lib/dashboard-data";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";

export default async function CollaboratorDashboardPage() {
  const session = await requireRole("COLLABORATOR");

  await writeAuditLog({
    actorId: session.userId,
    action: "COLLABORATOR_DATA_READ",
    resourceType: "Dashboard",
    resourceId: "collaborator-dashboard"
  });

  const data = await getCollaboratorDashboardData(session.userId);

  return (
    <AppShell role={session.role}>
      <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
        Collaborator Suite
      </p>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
        Partnership and investment room.
      </h1>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
        Review campaign involvement, film investment expressions of interest, and secure
        collaboration records.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <DashboardCard
          title="EOI Submissions"
          value={String(data.eoiSubmissions.length)}
          description="Encrypted film investment expressions linked to this account."
        />

        <DashboardCard
          title="Submitted Value"
          value={formatCurrencyFromCents(
            data.eoiSubmissions.reduce(
              (total, eoiSubmission) => total + eoiSubmission.investmentAmountCents,
              0
            ),
            "AUD"
          )}
          description="Total submitted investment interest."
        />

        <DashboardCard
          title="Compliance"
          value={data.eoiSubmissions[0]?.complianceStatus ?? "No EOI"}
          description="Latest compliance review status."
        />
      </div>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-5">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Film Investment EOI
        </h2>

        <div className="mt-5 grid gap-3">
          {data.eoiSubmissions.length === 0 ? (
            <p className="text-sm text-[var(--maurie-muted)]">No EOI submissions found.</p>
          ) : (
            data.eoiSubmissions.map((submission) => (
              <article
                key={submission.id}
                className="rounded-3xl border border-[var(--maurie-border)] bg-white/40 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                      {submission.referenceCode}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                      {submission.filmProjectName}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--maurie-muted)]">
                      {formatCurrencyFromCents(
                        submission.investmentAmountCents,
                        submission.currency
                      )}
                    </p>
                  </div>

                  <span className="rounded-full bg-[var(--maurie-yellow)] px-3 py-1 text-xs font-bold text-[var(--maurie-black)]">
                    {submission.complianceStatus}
                  </span>
                </div>

                <p className="mt-4 text-xs text-[var(--maurie-muted)]">
                  Submitted: {formatDateTime(submission.submittedAt)}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}
