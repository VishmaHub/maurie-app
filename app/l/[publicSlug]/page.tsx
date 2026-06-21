import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/ui/status-badge";
import { getPublishedListingBySlug } from "@/lib/client-listing";
import { formatDate } from "@/lib/formatters";

interface PublicListingPageProps {
  readonly params: Promise<{
    readonly publicSlug: string;
  }>;
}

export default async function PublicListingPage(props: PublicListingPageProps) {
  const params = await props.params;
  const listing = await getPublishedListingBySlug(params.publicSlug);

  if (listing === null) {
    notFound();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <section className="maurie-glass grid w-full max-w-6xl gap-8 rounded-[2rem] p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
        <div>
          <Link
            href="/"
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(89,55,50,0.16)] bg-[linear-gradient(135deg,var(--maurie-yellow),var(--maurie-orange))] text-base font-black tracking-tight text-[var(--maurie-black)] shadow-[0_14px_34px_rgba(234,109,48,0.24)]"
          >
            ME
          </Link>

          <p className="mt-8 text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Mauri-E Business Listing
          </p>

          <h1 className="mt-4 text-5xl font-semibold leading-[0.96] tracking-tight text-[var(--maurie-text)]">
            {listing.businessName}
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--maurie-muted)]">
            {listing.headline}
          </p>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-[var(--maurie-muted)]">
            {listing.description ?? "This business has not added a detailed description yet."}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {listing.websiteUrl !== null ? (
              <Link href={listing.websiteUrl} className="maurie-button-primary">
                Visit Website
              </Link>
            ) : null}

            {listing.contactEmail !== null ? (
              <Link href={`mailto:${listing.contactEmail}`} className="maurie-button-secondary">
                Contact Business
              </Link>
            ) : null}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-[var(--maurie-border)] bg-[var(--maurie-black)] p-5 text-[var(--maurie-cream)] shadow-[0_24px_80px_rgba(89,55,50,0.22)]">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/60">
              Active Offers
            </p>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Current business offers.</h2>

            <p className="mt-4 text-sm leading-6 text-white/70">
              Offers are published by the business through their Mauri-E listing hub.
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            {listing.offers.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-sm text-white/70">No active offers are currently published.</p>
              </div>
            ) : (
              listing.offers.map((offer) => (
                <article
                  key={offer.id}
                  className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-semibold text-white">{offer.title}</h3>
                    <StatusBadge label="ACTIVE" tone="orange" />
                  </div>

                  <p className="mt-3 text-sm leading-6 text-white/70">
                    {offer.description ?? "No offer description has been added yet."}
                  </p>

                  <p className="mt-4 text-xs text-white/50">
                    {formatDate(offer.startsAt)} → {formatDate(offer.endsAt)}
                  </p>
                </article>
              ))
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
