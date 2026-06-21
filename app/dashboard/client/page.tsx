import { AppShell } from "@/components/layout/app-shell";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { getClientDashboardData } from "@/lib/dashboard-data";
import { formatCurrencyFromCents, formatDate } from "@/lib/formatters";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";

export default async function ClientDashboardPage() {
  const session = await requireRole("CLIENT");

  await writeAuditLog({
    actorId: session.userId,
    action: "CLIENT_DATA_READ",
    resourceType: "Dashboard",
    resourceId: "client-dashboard"
  });

  const data = await getClientDashboardData(session.userId);

  return (
    <AppShell role={session.role}>
      <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
        Client Workspace
      </p>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
        Project command centre.
      </h1>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
        Track active work, financial status, and delivery progress across your assigned Mauri-E
        projects.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <DashboardCard
          title="Projects"
          value={String(data.projects.length)}
          description="Projects assigned to this client account."
        />

        <DashboardCard
          title="Invoices"
          value={String(data.invoices.length)}
          description="Invoices linked to your account."
        />

        <DashboardCard
          title="Outstanding"
          value={formatCurrencyFromCents(
            data.invoices
              .filter((invoice) => invoice.paymentStatus !== "PAID")
              .reduce((total, invoice) => total + invoice.amountCents, 0),
            "AUD"
          )}
          description="Total value of invoices not yet marked as paid."
        />
      </div>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Active Projects
          </h2>

          <div className="mt-5 grid gap-3">
            {data.projects.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No projects found.</p>
            ) : (
              data.projects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/40 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                        {project.projectCode}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                        {project.title}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--maurie-muted)]">
                        Creative: {project.creativeName}
                      </p>
                    </div>

                    <span className="rounded-full bg-[var(--maurie-yellow)] px-3 py-1 text-xs font-bold text-[var(--maurie-black)]">
                      {project.status}
                    </span>
                  </div>

                  <p className="mt-4 text-xs text-[var(--maurie-muted)]">
                    {project.milestoneCount} milestones · {project.invoiceCount} invoices
                  </p>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Invoices
          </h2>

          <div className="mt-5 grid gap-3">
            {data.invoices.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No invoices found.</p>
            ) : (
              data.invoices.map((invoice) => (
                <article
                  key={invoice.id}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/40 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                        {invoice.invoiceNumber}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                        {formatCurrencyFromCents(invoice.amountCents, invoice.currency)}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--maurie-muted)]">
                        GST: {formatCurrencyFromCents(invoice.gstCents, invoice.currency)}
                      </p>
                    </div>

                    <span className="rounded-full bg-[var(--maurie-orange)] px-3 py-1 text-xs font-bold text-[var(--maurie-black)]">
                      {invoice.paymentStatus}
                    </span>
                  </div>

                  <p className="mt-4 text-xs text-[var(--maurie-muted)]">
                    Due: {formatDate(invoice.dueAt)}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
