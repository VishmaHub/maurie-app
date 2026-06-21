import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { getClientProjects } from "@/lib/client-projects";
import { formatDate } from "@/lib/formatters";

export default async function ClientProjectsPage() {
  const session = await requireRole("CLIENT");

  await writeAuditLog({
    actorId: session.userId,
    action: "CLIENT_DATA_READ",
    resourceType: "ClientProjects",
    resourceId: "client-project-list"
  });

  const projects = await getClientProjects(session.userId);

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Client Projects
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Project pipeline.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            View your active Mauri-E projects, assigned creative partners, delivery milestones, and
            invoice activity from one secure workspace.
          </p>
        </div>

        <Link href="/dashboard/client" className="maurie-button-secondary">
          Back to Dashboard
        </Link>
      </div>

      <section className="mt-8 grid gap-4">
        {projects.length === 0 ? (
          <div className="maurie-glass-soft rounded-3xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              No projects found.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Once a Mauri-E project is assigned to your client account, it will appear here.
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
                href={`/dashboard/client/projects/${project.id}`}
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
                        {project.summary ?? "No project summary has been added yet."}
                      </p>
                    </div>

                    <StatusBadge label={project.status} tone="yellow" />
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                    <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                      <p className="text-xs text-[var(--maurie-muted)]">Creative</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                        {project.creativeName}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                      <p className="text-xs text-[var(--maurie-muted)]">Milestones</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                        {project.completedMilestoneCount}/{project.milestoneCount} completed
                      </p>
                    </div>

                    <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                      <p className="text-xs text-[var(--maurie-muted)]">Progress</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                        {progressPercentage}%
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
