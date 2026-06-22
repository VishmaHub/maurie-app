import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminCreatives } from "@/lib/admin-creatives";
import { requireRole } from "@/lib/auth/require-role";
import { formatDate } from "@/lib/formatters";

export default async function AdminCreativesPage() {
  const session = await requireRole("ADMIN");

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminCreatives",
    resourceId: "admin-creative-records"
  });

  const creatives = await getAdminCreatives();

  const activeCreatives = creatives.filter((creative) => creative.isActive);
  const publicProfiles = creatives.filter((creative) => creative.hasPublicCreativeProfile);
  const totalProjects = creatives.reduce(
    (total, creative): number => total + creative.assignedProjectCount,
    0
  );
  const totalBookings = creatives.reduce(
    (total, creative): number => total + creative.bookingCount,
    0
  );
  const totalPortfolioItems = creatives.reduce(
    (total, creative): number => total + creative.portfolioItemCount,
    0
  );

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Admin Creative Records
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Creative accounts.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            View creative accounts, assigned projects, bookings, public profile status, portfolio
            items, and linked delivery records from an admin-only Mauri-E workspace.
          </p>
        </div>

        <Link href="/dashboard/admin" className="maurie-button-secondary">
          Back to Admin
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Creatives</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {creatives.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Active</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {activeCreatives.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Public Profiles</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {publicProfiles.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Projects</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">{totalProjects}</p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Bookings</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">{totalBookings}</p>
        </div>
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-5">
        <p className="text-sm text-[var(--maurie-muted)]">Portfolio Items</p>
        <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
          {totalPortfolioItems}
        </p>
      </section>

      <section className="mt-8 grid gap-4">
        {creatives.length === 0 ? (
          <div className="maurie-glass-soft rounded-3xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              No creatives found.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Creative accounts will appear here once they are created.
            </p>
          </div>
        ) : (
          creatives.map((creative) => (
            <Link
              key={creative.id}
              href={`/dashboard/admin/creatives/${creative.id}`}
              className="maurie-glass-soft group rounded-3xl p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(89,55,50,0.16)]"
            >
              <article>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                      CREATIVE
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--maurie-text)]">
                      {creative.displayName}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                      {creative.email}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <StatusBadge
                      label={creative.isActive ? "ACTIVE" : "INACTIVE"}
                      tone={creative.isActive ? "yellow" : "neutral"}
                    />

                    <StatusBadge
                      label={creative.hasPublicCreativeProfile ? "PROFILE READY" : "NO PROFILE"}
                      tone={creative.hasPublicCreativeProfile ? "yellow" : "neutral"}
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-5">
                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Projects</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {creative.assignedProjectCount}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Bookings</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {creative.bookingCount}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Portfolio</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {creative.portfolioItemCount}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Handle</p>
                    <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                      {creative.creativeHandle ?? "Not available"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Created</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDate(creative.createdAt)}
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          ))
        )}
      </section>
    </AppShell>
  );
}
