import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { getClientProjectDetail } from "@/lib/client-projects";
import { formatCurrencyFromCents, formatDate } from "@/lib/formatters";

interface ClientProjectDetailPageProps {
  readonly params: Promise<{
    readonly projectId: string;
  }>;
}

export default async function ClientProjectDetailPage(props: ClientProjectDetailPageProps) {
  const session = await requireRole("CLIENT");
  const params = await props.params;

  const project = await getClientProjectDetail({
    userId: session.userId,
    projectId: params.projectId
  });

  if (project === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "ClientProject",
      resourceId: params.projectId,
      metadata: {
        reason: "project-not-found-or-not-owned"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "CLIENT_DATA_READ",
    resourceType: "ClientProject",
    resourceId: project.id
  });

  const completedMilestones: number = project.milestones.filter(
    (milestone): boolean => milestone.completedAt !== null
  ).length;

  const progressPercentage: number =
    project.milestones.length === 0
      ? 0
      : Math.round((completedMilestones / project.milestones.length) * 100);

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            {project.projectCode}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            {project.title}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            {project.summary ?? "No project summary has been added yet."}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/client/projects" className="maurie-button-secondary">
            Back to Projects
          </Link>
          <StatusBadge label={project.status} tone="yellow" />
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Creative Partner</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {project.creativeName}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Milestone Progress</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {completedMilestones}/{project.milestones.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Completion</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {progressPercentage}%
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Timeline</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDate(project.startsAt)} → {formatDate(project.endsAt)}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Milestones
          </h2>

          <div className="mt-5 grid gap-3">
            {project.milestones.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No milestones found.</p>
            ) : (
              project.milestones.map((milestone) => (
                <article
                  key={milestone.id}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                        Milestone {milestone.sortOrder}
                      </p>

                      <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                        {milestone.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                        {milestone.description ?? "No description has been added yet."}
                      </p>
                    </div>

                    <StatusBadge
                      label={milestone.completedAt === null ? "Pending" : "Completed"}
                      tone={milestone.completedAt === null ? "neutral" : "orange"}
                    />
                  </div>

                  <p className="mt-4 text-xs text-[var(--maurie-muted)]">
                    Completed: {formatDate(milestone.completedAt)}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Project Invoices
          </h2>

          <div className="mt-5 grid gap-3">
            {project.invoices.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No invoices found.</p>
            ) : (
              project.invoices.map((invoice) => (
                <article
                  key={invoice.id}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
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

                      <p className="mt-1 text-xs text-[var(--maurie-muted)]">
                        Tax: {invoice.taxStatus}
                      </p>
                    </div>

                    <StatusBadge label={invoice.paymentStatus} tone="orange" />
                  </div>

                  <div className="mt-4 grid gap-2 text-xs text-[var(--maurie-muted)]">
                    <p>Issued: {formatDate(invoice.issuedAt)}</p>
                    <p>Due: {formatDate(invoice.dueAt)}</p>
                    <p>Paid: {formatDate(invoice.paidAt)}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
