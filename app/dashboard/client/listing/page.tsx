import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { getClientListing } from "@/lib/client-listing";
import { formatDate } from "@/lib/formatters";

export default async function ClientListingPage() {
  const session = await requireRole("CLIENT");

  await writeAuditLog({
    actorId: session.userId,
    action: "CLIENT_DATA_READ",
    resourceType: "ClientListing",
    resourceId: "client-listing-hub"
  });

  const listing = await getClientListing(session.userId);

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Client Listing Hub
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Business listing and landing page.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            Manage the public-facing business profile, active offers, contact details, and
            landing-page-ready listing structure for your Mauri-E presence.
          </p>
        </div>

        <Link href="/dashboard/client" className="maurie-button-secondary">
          Back to Dashboard
        </Link>
      </div>

      {listing === null ? (
        <section className="maurie-glass-soft mt-8 rounded-3xl p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            No listing found.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
            Once a listing is created for your client account, it will appear here.
          </p>
        </section>
      ) : (
        <>
          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="maurie-glass-soft rounded-3xl p-5">
              <p className="text-sm text-[var(--maurie-muted)]">Listing Status</p>
              <div className="mt-3">
                <StatusBadge
                  label={listing.isPublished ? "PUBLISHED" : "DRAFT"}
                  tone={listing.isPublished ? "yellow" : "neutral"}
                />
              </div>
            </div>

            <div className="maurie-glass-soft rounded-3xl p-5">
              <p className="text-sm text-[var(--maurie-muted)]">Active Offers</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
                {listing.offers.filter((offer) => offer.isActive).length}
              </p>
            </div>

            <div className="maurie-glass-soft rounded-3xl p-5">
              <p className="text-sm text-[var(--maurie-muted)]">Last Updated</p>
              <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
                {formatDate(listing.updatedAt)}
              </p>
            </div>
          </section>

          <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <div className="maurie-glass-soft rounded-3xl p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                    /l/{listing.publicSlug}
                  </p>

                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--maurie-text)]">
                    {listing.businessName}
                  </h2>

                  <p className="mt-3 text-base leading-7 text-[var(--maurie-muted)]">
                    {listing.headline}
                  </p>
                </div>

                <Link href={`/l/${listing.publicSlug}`} className="maurie-button-primary">
                  View Public Page
                </Link>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                  <p className="text-xs text-[var(--maurie-muted)]">Description</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--maurie-text)]">
                    {listing.description ?? "No description has been added yet."}
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Website</p>
                    <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                      {listing.websiteUrl ?? "Not added"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Contact Email</p>
                    <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                      {listing.contactEmail ?? "Not added"}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                  <p className="text-xs text-[var(--maurie-muted)]">SEO Preview</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--maurie-text)]">
                    {listing.seoTitle ?? listing.businessName}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                    {listing.seoDescription ?? listing.headline}
                  </p>
                </div>
              </div>
            </div>

            <aside className="maurie-glass-soft rounded-3xl p-5">
              <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
                Active Offers
              </h2>

              <div className="mt-5 grid gap-3">
                {listing.offers.length === 0 ? (
                  <p className="text-sm text-[var(--maurie-muted)]">No offers found.</p>
                ) : (
                  listing.offers.map((offer) => (
                    <article
                      key={offer.id}
                      className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-semibold text-[var(--maurie-text)]">
                            {offer.title}
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                            {offer.description ?? "No description has been added yet."}
                          </p>
                        </div>

                        <StatusBadge
                          label={offer.isActive ? "ACTIVE" : "INACTIVE"}
                          tone={offer.isActive ? "orange" : "neutral"}
                        />
                      </div>

                      <p className="mt-4 text-xs text-[var(--maurie-muted)]">
                        {formatDate(offer.startsAt)} → {formatDate(offer.endsAt)}
                      </p>
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
