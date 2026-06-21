import { AppShell } from "@/components/layout/app-shell";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { getCreativeDashboardData } from "@/lib/dashboard-data";
import { formatDateTime } from "@/lib/formatters";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";

export default async function CreativeDashboardPage() {
  const session = await requireRole("CREATIVE");

  await writeAuditLog({
    actorId: session.userId,
    action: "CREATIVE_DATA_READ",
    resourceType: "Dashboard",
    resourceId: "creative-dashboard"
  });

  const data = await getCreativeDashboardData(session.userId);

  return (
    <AppShell role={session.role}>
      <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
        Creative Studio
      </p>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
        Creative operating room.
      </h1>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
        Manage assigned projects, bookings, creative commitments, and delivery activity.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <DashboardCard
          title="Assigned Projects"
          value={String(data.projects.length)}
          description="Projects where this creative is assigned."
        />

        <DashboardCard
          title="Bookings"
          value={String(data.bookings.length)}
          description="Scheduled creative appointments."
        />

        <DashboardCard
          title="Next Booking"
          value={
            data.bookings[0] === undefined ? "None" : formatDateTime(data.bookings[0].scheduledTime)
          }
          description="Nearest upcoming booking in your local workflow."
        />
      </div>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Assigned Projects
          </h2>

          <div className="mt-5 grid gap-3">
            {data.projects.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No assigned projects found.</p>
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
                        Client: {project.clientName}
                      </p>
                    </div>

                    <span className="rounded-full bg-[var(--maurie-yellow)] px-3 py-1 text-xs font-bold text-[var(--maurie-black)]">
                      {project.status}
                    </span>
                  </div>

                  <p className="mt-4 text-xs text-[var(--maurie-muted)]">
                    {project.milestoneCount} milestones
                  </p>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Bookings
          </h2>

          <div className="mt-5 grid gap-3">
            {data.bookings.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No bookings found.</p>
            ) : (
              data.bookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/40 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--maurie-text)]">
                        {booking.clientName}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--maurie-muted)]">
                        {booking.clientEmail}
                      </p>
                      <p className="mt-2 text-xs text-[var(--maurie-muted)]">
                        {formatDateTime(booking.scheduledTime)} · {booking.durationMinutes} minutes
                      </p>
                    </div>

                    <span className="rounded-full bg-[var(--maurie-orange)] px-3 py-1 text-xs font-bold text-[var(--maurie-black)]">
                      {booking.status}
                    </span>
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
