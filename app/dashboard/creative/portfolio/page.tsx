import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { getCreativePortfolioHub } from "@/lib/creative-portfolio";
import { formatDate } from "@/lib/formatters";

export default async function CreativePortfolioPage() {
  const session = await requireRole("CREATIVE");

  await writeAuditLog({
    actorId: session.userId,
    action: "CREATIVE_DATA_READ",
    resourceType: "CreativePortfolio",
    resourceId: "creative-portfolio-hub"
  });

  const profile = await getCreativePortfolioHub(session.userId);

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Creative Portfolio
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Portfolio and vCard hub.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            Manage your public creative profile, portfolio presentation, contact details, and
            downloadable vCard structure for Mauri-E collaborations.
          </p>
        </div>

        <Link href="/dashboard/creative" className="maurie-button-secondary">
          Back to Dashboard
        </Link>
      </div>

      {profile === null ? (
        <section className="maurie-glass-soft mt-8 rounded-3xl p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            No creative profile found.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
            Once your Mauri-E creative profile is created, it will appear here.
          </p>
        </section>
      ) : (
        <>
          <section className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="maurie-glass-soft rounded-3xl p-5">
              <p className="text-sm text-[var(--maurie-muted)]">Profile Status</p>
              <div className="mt-3">
                <StatusBadge
                  label={profile.isPublished ? "PUBLISHED" : "DRAFT"}
                  tone={profile.isPublished ? "yellow" : "neutral"}
                />
              </div>
            </div>

            <div className="maurie-glass-soft rounded-3xl p-5">
              <p className="text-sm text-[var(--maurie-muted)]">Portfolio Items</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
                {profile.items.length}
              </p>
            </div>

            <div className="maurie-glass-soft rounded-3xl p-5">
              <p className="text-sm text-[var(--maurie-muted)]">Published Items</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
                {profile.items.filter((item) => item.isPublished).length}
              </p>
            </div>

            <div className="maurie-glass-soft rounded-3xl p-5">
              <p className="text-sm text-[var(--maurie-muted)]">Last Updated</p>
              <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
                {formatDate(profile.updatedAt)}
              </p>
            </div>
          </section>

          <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <div className="maurie-glass-soft rounded-3xl p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                    /c/{profile.publicHandle}
                  </p>

                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--maurie-text)]">
                    {profile.creativeName}
                  </h2>

                  <p className="mt-3 text-base leading-7 text-[var(--maurie-muted)]">
                    {profile.headline}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href={`/c/${profile.publicHandle}`} className="maurie-button-primary">
                    View Public Profile
                  </Link>

                  <Link
                    href={`/c/${profile.publicHandle}/vcard`}
                    className="maurie-button-secondary"
                  >
                    Download vCard
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                  <p className="text-xs text-[var(--maurie-muted)]">Bio</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--maurie-text)]">
                    {profile.bio ?? "No bio has been added yet."}
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Location</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {profile.locationLabel ?? "Not added"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Contact Email</p>
                    <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                      {profile.contactEmail ?? profile.creativeEmail}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                  <p className="text-xs text-[var(--maurie-muted)]">Website</p>
                  <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                    {profile.websiteUrl ?? "Not added"}
                  </p>
                </div>
              </div>
            </div>

            <aside className="maurie-glass-soft rounded-3xl p-5">
              <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
                Portfolio Items
              </h2>

              <div className="mt-5 grid gap-3">
                {profile.items.length === 0 ? (
                  <p className="text-sm text-[var(--maurie-muted)]">No portfolio items found.</p>
                ) : (
                  profile.items.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                            {item.category}
                          </p>

                          <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                            {item.title}
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                            {item.description ?? "No description has been added yet."}
                          </p>
                        </div>

                        <StatusBadge
                          label={item.isPublished ? "PUBLIC" : "DRAFT"}
                          tone={item.isPublished ? "orange" : "neutral"}
                        />
                      </div>

                      {item.externalUrl !== null ? (
                        <a
                          href={item.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex text-sm font-bold text-[var(--maurie-brown)]"
                        >
                          View work
                        </a>
                      ) : null}
                    </article>
                  ))
                )}
              </div>
            </aside>
          </section>
        </>
      )}
    </AppShell>
  );
}
