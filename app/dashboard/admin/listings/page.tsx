import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminListings } from "@/lib/admin-listings";
import { requireRole } from "@/lib/auth/require-role";
import { formatDate } from "@/lib/formatters";

export default async function AdminListingsPage() {
  const session = await requireRole("ADMIN");

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminListings",
    resourceId: "admin-listing-records"
  });

  const listings = await getAdminListings();

  const publishedListings = listings.filter((listing) => listing.isPublished);
  const draftListings = listings.filter((listing) => !listing.isPublished);

  const totalOffers = listings.reduce((total, listing): number => total + listing.offerCount, 0);

  const activeOffers = listings.reduce(
    (total, listing): number => total + listing.activeOfferCount,
    0
  );

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Admin Listing Records
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Business listings.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            View client-owned business listings, public listing URLs, publication status, contact
            details, SEO metadata, and active offers from an admin-only Mauri-E workspace.
          </p>
        </div>

        <Link href="/dashboard/admin" className="maurie-button-secondary">
          Back to Admin
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Listings</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">{listings.length}</p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Published</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {publishedListings.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Drafts</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {draftListings.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Offers</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">{totalOffers}</p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Active Offers</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">{activeOffers}</p>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {listings.length === 0 ? (
          <div className="maurie-glass-soft rounded-3xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              No listings found.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Client business listings will appear here once they are created.
            </p>
          </div>
        ) : (
          listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/dashboard/admin/listings/${listing.id}`}
              className="maurie-glass-soft group rounded-3xl p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(89,55,50,0.16)]"
            >
              <article>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                      /l/{listing.publicSlug}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--maurie-text)]">
                      {listing.businessName}
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
                      {listing.headline}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <StatusBadge
                      label={listing.isPublished ? "PUBLISHED" : "DRAFT"}
                      tone={listing.isPublished ? "yellow" : "neutral"}
                    />

                    <StatusBadge
                      label={`${listing.activeOfferCount} ACTIVE OFFERS`}
                      tone={listing.activeOfferCount > 0 ? "yellow" : "neutral"}
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-5">
                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Client</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {listing.clientName}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Offers</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {listing.offerCount}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Contact Email</p>
                    <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                      {listing.contactEmail ?? "Not recorded"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Website</p>
                    <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                      {listing.websiteUrl ?? "Not recorded"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Created</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDate(listing.createdAt)}
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
