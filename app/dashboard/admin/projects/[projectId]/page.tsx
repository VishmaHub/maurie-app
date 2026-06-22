import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminProjectDetail } from "@/lib/admin-projects";
import { requireRole } from "@/lib/auth/require-role";
import { formatCurrencyFromCents, formatDate, formatDateTime } from "@/lib/formatters";

interface AdminProjectDetailPageProps {
  readonly params: Promise<{
    readonly projectId: string;
  }>;
}

function getProjectStatusTone(status: string): "yellow" | "orange" | "neutral" {
  if (status === "ACTIVE" || status === "COMPLETED") {
    return "yellow";
  }

  if (status === "REVIEW" || status === "ON_HOLD") {
    return "orange";
  }

  return "neutral";
}

export default async function AdminProjectDetailPage(props: AdminProjectDetailPageProps) {
  const session = await requireRole("ADMIN");
  const params = await props.params;

  const project = await getAdminProjectDetail(params.projectId);

  if (project === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "AdminProject",
      resourceId: params.projectId,
      metadata: {
        reason: "project-not-found"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminProject",
    resourceId: project.id
  });

  const completedMilestones: number = project.milestones.filter(
    (milestone): boolean => milestone.completedAt !== null
  ).length;

  const progressPercentage: number =
    project.milestones.length === 0
      ? 0
      : Math.round((completedMilestones / project.milestones.length) * 100);

  const invoiceTotalCents: number = project.invoices.reduce(
    (total, invoice): number => total + invoice.amountCents,
    0
  );

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
            {project.summary ?? "No project summary available."}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/admin/projects" className="maurie-button-secondary">
            Back to Projects
          </Link>

          <StatusBadge label={project.status} tone={getProjectStatusTone(project.status)} />
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Status</p>
          <div className="mt-3">
            <StatusBadge label={project.status} tone={getProjectStatusTone(project.status)} />
          </div>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Progress</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {progressPercentage}%
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Milestones</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {completedMilestones}/{project.milestones.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Invoices</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {project.invoices.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Invoice Value</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--maurie-text)]">
            {formatCurrencyFromCents(invoiceTotalCents, "AUD")}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Project Ownership
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Client</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {project.clientName}
              </p>
              <p className="mt-1 break-words text-xs text-[var(--maurie-muted)]">
                {project.clientEmail}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Creative</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {project.creativeName}
              </p>
              <p className="mt-1 break-words text-xs text-[var(--maurie-muted)]">
                {project.creativeEmail}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                <p className="text-xs text-[var(--maurie-muted)]">Start</p>
                <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                  {formatDate(project.startsAt)}
                </p>
              </div>

              <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                <p className="text-xs text-[var(--maurie-muted)]">End</p>
                <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                  {formatDate(project.endsAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Project Metadata
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Project ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {project.id}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Client ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {project.clientId}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Creative ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {project.creativeId}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Created</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {formatDateTime(project.createdAt)}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Updated</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {formatDateTime(project.updatedAt)}
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
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
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                        Milestone {milestone.sortOrder}
                      </p>

                      <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                        {milestone.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                        {milestone.description ?? "No milestone description available."}
                      </p>
                    </div>

                    <StatusBadge
                      label={milestone.completedAt === null ? "PENDING" : "COMPLETED"}
                      tone={milestone.completedAt === null ? "neutral" : "yellow"}
                    />
                  </div>
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
            {project.invoices.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No invoices found.</p>
            ) : (
              project.invoices.map((invoice) => (
                <article
                  key={invoice.id}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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

                    <StatusBadge label={invoice.paymentStatus} tone="orange" />
                  </div>

                  <p className="mt-3 text-xs text-[var(--maurie-muted)]">
                    Issued: {formatDate(invoice.issuedAt)} · Due: {formatDate(invoice.dueAt)} ·
                    Paid: {formatDate(invoice.paidAt)}
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
