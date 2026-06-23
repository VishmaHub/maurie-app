import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { FormNotice } from "@/components/ui/form-notice";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminListingDetail } from "@/lib/admin-listings";
import { requireRole } from "@/lib/auth/require-role";
import { formatDate, formatDateTime } from "@/lib/formatters";

interface AdminListingDetailPageProps {
  readonly params: Promise<{
    readonly listingId: string;
  }>;
  readonly searchParams: Promise<{
    readonly status?: string;
  }>;
}

export default async function AdminListingDetailPage(props: AdminListingDetailPageProps) {
  const session = await requireRole("ADMIN");
  const params = await props.params;
  const searchParams = await props.searchParams;

  const listing = await getAdminListingDetail(params.listingId);

  if (listing === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "AdminListing",
      resourceId: params.listingId,
      metadata: {
        reason: "listing-not-found"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminListing",
    resourceId: listing.id
  });

  const activeOffers = listing.offers.filter((offer): boolean => offer.isActive);

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            /l/{listing.publicSlug}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            {listing.businessName}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            {listing.headline}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/dashboard/admin/listings/${listing.id}/edit`}
            className="maurie-button-primary"
          >
            Edit Listing
          </Link>

          <Link href="/dashboard/admin/listings" className="maurie-button-secondary">
            Back to Listings
          </Link>

          <StatusBadge
            label={listing.isPublished ? "PUBLISHED" : "DRAFT"}
            tone={listing.isPublished ? "yellow" : "neutral"}
          />
        </div>
      </div>

      {searchParams.status === "updated" ? (
        <FormNotice
          title="Listing updated."
          message="The listing content and publication settings were saved successfully."
          tone="success"
          className="mt-8"
        />
      ) : null}

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Status</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {listing.isPublished ? "Published" : "Draft"}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Offers</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {listing.offers.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Active Offers</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {activeOffers.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Created</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDateTime(listing.createdAt)}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Updated</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDateTime(listing.updatedAt)}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Listing Details
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Business Name</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {listing.businessName}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Headline</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {listing.headline}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Description</p>
              <p className="mt-1 text-sm leading-6 text-[var(--maurie-text)]">
                {listing.description ?? "No listing description available."}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                <p className="text-xs text-[var(--maurie-muted)]">Contact Email</p>
                <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                  {listing.contactEmail ?? "Not recorded"}
                </p>
              </div>

              <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                <p className="text-xs text-[var(--maurie-muted)]">Phone</p>
                <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                  {listing.contactPhoneE164 ?? "Not recorded"}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Website</p>
              <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                {listing.websiteUrl ?? "Not recorded"}
              </p>
            </div>
          </div>
        </div>

        <aside className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Ownership & Metadata
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Client</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {listing.clientName}
              </p>
              <p className="mt-1 break-words text-xs text-[var(--maurie-muted)]">
                {listing.clientEmail}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Listing ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {listing.id}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Client ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {listing.clientId}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Public URL</p>
              <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                /l/{listing.publicSlug}
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-5">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          SEO Metadata
        </h2>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">SEO Title</p>
            <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
              {listing.seoTitle ?? "Not recorded"}
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">SEO Description</p>
            <p className="mt-1 text-sm leading-6 text-[var(--maurie-text)]">
              {listing.seoDescription ?? "Not recorded"}
            </p>
          </div>
        </div>
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-5">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Listing Offers
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                      Offer
                    </p>

                    <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                      {offer.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                      {offer.description ?? "No offer description available."}
                    </p>
                  </div>

                  <StatusBadge
                    label={offer.isActive ? "ACTIVE" : "INACTIVE"}
                    tone={offer.isActive ? "yellow" : "neutral"}
                  />
                </div>

                <p className="mt-3 text-xs text-[var(--maurie-muted)]">
                  Start: {formatDate(offer.startsAt)} · End: {formatDate(offer.endsAt)}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}
