import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminCreativeDetail } from "@/lib/admin-creatives";
import { requireRole } from "@/lib/auth/require-role";
import { formatDate, formatDateTime } from "@/lib/formatters";

interface AdminCreativeDetailPageProps {
  readonly params: Promise<{
    readonly creativeId: string;
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

function getBookingEndTime(scheduledTime: Date, durationMinutes: number): Date {
  return new Date(scheduledTime.getTime() + durationMinutes * 60 * 1000);
}

export default async function AdminCreativeDetailPage(props: AdminCreativeDetailPageProps) {
  const session = await requireRole("ADMIN");
  const params = await props.params;

  const creative = await getAdminCreativeDetail(params.creativeId);

  if (creative === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "AdminCreative",
      resourceId: params.creativeId,
      metadata: {
        reason: "creative-not-found"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminCreative",
    resourceId: creative.id
  });

  const publishedPortfolioItems = creative.portfolioItems.filter(
    (portfolioItem): boolean => portfolioItem.isPublished
  );

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Creative Record
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            {creative.profile?.displayName ?? creative.email}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            {creative.email}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/admin/creatives" className="maurie-button-secondary">
            Back to Creatives
          </Link>

          <StatusBadge
            label={creative.isActive ? "ACTIVE" : "INACTIVE"}
            tone={creative.isActive ? "yellow" : "neutral"}
          />
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Projects</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {creative.projects.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Bookings</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {creative.bookings.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Portfolio</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {creative.portfolioItems.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Published Items</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {publishedPortfolioItems.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Public Profile</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {creative.publicCreativeProfile === null ? "Not Ready" : "Ready"}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Creative Profile
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Normalised Email</p>
              <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                {creative.normalizedEmail}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Public Slug</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {creative.profile?.publicSlug ?? "Not available"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Profile Visibility</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {creative.profile?.isPublic === true ? "Public" : "Private"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Bio</p>
              <p className="mt-1 text-sm leading-6 text-[var(--maurie-text)]">
                {creative.profile?.bio ?? "No bio available."}
              </p>
            </div>
          </div>
        </div>

        <aside className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Account Metadata
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">User ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {creative.id}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Created</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {formatDateTime(creative.createdAt)}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Updated</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {formatDateTime(creative.updatedAt)}
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-5">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Public Creative Page
        </h2>

        {creative.publicCreativeProfile === null ? (
          <p className="mt-4 text-sm leading-6 text-[var(--maurie-muted)]">
            No public creative profile has been created for this creative.
          </p>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Handle</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                /c/{creative.publicCreativeProfile.publicHandle}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Status</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {creative.publicCreativeProfile.isPublished ? "Published" : "Draft"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4 md:col-span-2">
              <p className="text-xs text-[var(--maurie-muted)]">Headline</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {creative.publicCreativeProfile.headline}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4 md:col-span-2">
              <p className="text-xs text-[var(--maurie-muted)]">Bio</p>
              <p className="mt-1 text-sm leading-6 text-[var(--maurie-text)]">
                {creative.publicCreativeProfile.bio ?? "No public bio available."}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-4">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Assigned Projects
          </h2>

          <div className="mt-5 grid gap-3">
            {creative.projects.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No assigned projects found.</p>
            ) : (
              creative.projects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                        {project.projectCode}
                      </p>

                      <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                        {project.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                        Client: {project.clientName} · {project.clientEmail}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                        {project.summary ?? "No project summary available."}
                      </p>
                    </div>

                    <StatusBadge
                      label={project.status}
                      tone={getProjectStatusTone(project.status)}
                    />
                  </div>

                  <p className="mt-3 text-xs text-[var(--maurie-muted)]">
                    Timeline: {formatDate(project.startsAt)} → {formatDate(project.endsAt)}
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
            {creative.bookings.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No bookings found.</p>
            ) : (
              creative.bookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                        {formatDateTime(booking.scheduledTime)}
                      </p>

                      <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                        Booking with {booking.clientName}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                        {booking.clientEmail}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                        {booking.notes ?? "No booking notes available."}
                      </p>
                    </div>

                    <StatusBadge label={booking.status} tone="neutral" />
                  </div>

                  <p className="mt-3 text-xs text-[var(--maurie-muted)]">
                    Ends:{" "}
                    {formatDateTime(
                      getBookingEndTime(booking.scheduledTime, booking.durationMinutes)
                    )}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Portfolio Items
          </h2>

          <div className="mt-5 grid gap-3">
            {creative.portfolioItems.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No portfolio items found.</p>
            ) : (
              creative.portfolioItems.map((portfolioItem) => (
                <article
                  key={portfolioItem.id}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                        {portfolioItem.category}
                      </p>

                      <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                        {portfolioItem.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                        {portfolioItem.description ?? "No portfolio description available."}
                      </p>
                    </div>

                    <StatusBadge
                      label={portfolioItem.isPublished ? "PUBLISHED" : "DRAFT"}
                      tone={portfolioItem.isPublished ? "yellow" : "neutral"}
                    />
                  </div>

                  <p className="mt-3 text-xs text-[var(--maurie-muted)]">
                    Sort order: {portfolioItem.sortOrder}
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
