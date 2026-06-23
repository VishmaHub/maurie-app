import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessListingForm } from "@/components/admin/business-listing-form";
import { AppShell } from "@/components/layout/app-shell";
import { updateBusinessListingAction } from "@/lib/admin-listing-actions";
import { getAdminListingClientOptions, getAdminListingDetail } from "@/lib/admin-listings";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";

interface AdminEditListingPageProps {
  readonly params: Promise<{
    readonly listingId: string;
  }>;
}

export default async function AdminEditListingPage(props: AdminEditListingPageProps) {
  const session = await requireRole("ADMIN");
  const params = await props.params;
  const [listing, clients] = await Promise.all([
    getAdminListingDetail(params.listingId),
    getAdminListingClientOptions()
  ]);

  if (listing === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "AdminListingEdit",
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
    resourceType: "AdminListingEdit",
    resourceId: listing.id
  });

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            /l/{listing.publicSlug}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Edit {listing.businessName}.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            Update ownership, public content, contact details, publication status, and search
            metadata.
          </p>
        </div>

        <Link href={`/dashboard/admin/listings/${listing.id}`} className="maurie-button-secondary">
          Back to Listing
        </Link>
      </div>

      <div className="mt-8">
        <BusinessListingForm
          action={updateBusinessListingAction}
          mode="edit"
          listingId={listing.id}
          clients={clients}
          initialValues={{
            clientId: listing.clientId,
            businessName: listing.businessName,
            publicSlug: listing.publicSlug,
            headline: listing.headline,
            description: listing.description,
            websiteUrl: listing.websiteUrl,
            contactEmail: listing.contactEmail,
            contactPhoneE164: listing.contactPhoneE164,
            seoTitle: listing.seoTitle,
            seoDescription: listing.seoDescription,
            isPublished: listing.isPublished
          }}
          cancelHref={`/dashboard/admin/listings/${listing.id}`}
        />
      </div>
    </AppShell>
  );
}
