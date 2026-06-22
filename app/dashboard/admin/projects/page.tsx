import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminProjects } from "@/lib/admin-projects";
import { requireRole } from "@/lib/auth/require-role";
import { formatCurrencyFromCents, formatDate } from "@/lib/formatters";

function getProjectStatusTone(status: string): "yellow" | "orange" | "neutral" {
  if (status === "ACTIVE" || status === "COMPLETED") {
    return "yellow";
  }

  if (status === "REVIEW" || status === "ON_HOLD") {
    return "orange";
  }

  return "neutral";
}

export default async function AdminProjectsPage() {
  const session = await requireRole("ADMIN");

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminProjects",
    resourceId: "admin-project-records"
  });

  const projects = await getAdminProjects();

  const activeProjects = projects.filter((project) => project.status === "ACTIVE");
  const completedProjects = projects.filter((project) => project.status === "COMPLETED");
  const invoiceTotalCents = projects.reduce(
    (total, project): number => total + project.invoiceTotalCents,
    0
  );

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Admin Project Records
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Project operations.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            View Mauri-E project records, client ownership, assigned creatives, milestones,
            invoices, timelines, and delivery status from an admin-only workspace.
          </p>
        </div>

        <Link href="/dashboard/admin" className="maurie-button-secondary">
          Back to Admin
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Projects</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">{projects.length}</p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Active</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {activeProjects.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {completedProjects.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Invoice Value</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--maurie-text)]">
            {formatCurrencyFromCents(invoiceTotalCents, "AUD")}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {projects.length === 0 ? (
          <div className="maurie-glass-soft rounded-3xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              No projects found.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Project records will appear here once they are created.
            </p>
          </div>
        ) : (
          projects.map((project) => {
            const progressPercentage: number =
              project.milestoneCount === 0
                ? 0
                : Math.round((project.completedMilestoneCount / project.milestoneCount) * 100);

            return (
              <Link
                key={project.id}
                href={`/dashboard/admin/projects/${project.id}`}
                className="maurie-glass-soft group rounded-3xl p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(89,55,50,0.16)]"
              >
                <article>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                        {project.projectCode}
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--maurie-text)]">
                        {project.title}
                      </h2>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
                        {project.summary ?? "No project summary available."}
                      </p>
                    </div>

                    <StatusBadge
                      label={project.status}
                      tone={getProjectStatusTone(project.status)}
                    />
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-5">
                    <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                      <p className="text-xs text-[var(--maurie-muted)]">Client</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                        {project.clientName}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                      <p className="text-xs text-[var(--maurie-muted)]">Creative</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                        {project.creativeName}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                      <p className="text-xs text-[var(--maurie-muted)]">Progress</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                        {progressPercentage}%
                      </p>
                    </div>

                    <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                      <p className="text-xs text-[var(--maurie-muted)]">Invoices</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                        {project.invoiceCount}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                      <p className="text-xs text-[var(--maurie-muted)]">Created</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                        {formatDate(project.createdAt)}
                      </p>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })
        )}
      </section>
    </AppShell>
  );
}
