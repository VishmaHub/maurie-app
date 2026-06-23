import Link from "next/link";
import { BusinessListingForm } from "@/components/admin/business-listing-form";
import { AppShell } from "@/components/layout/app-shell";
import { FormNotice } from "@/components/ui/form-notice";
import { createBusinessListingAction } from "@/lib/admin-listing-actions";
import { getAdminListingClientOptions } from "@/lib/admin-listings";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminNewListingPage() {
  const session = await requireRole("ADMIN");
  const clients = await getAdminListingClientOptions();
  const activeClients = clients.filter((client): boolean => client.isActive);

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminListingCreate",
    resourceId: "new-business-listing"
  });

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Admin Listing Create
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Create a business listing.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            Assign a client owner, prepare the public listing content, and choose whether it is
            ready to publish.
          </p>
        </div>

        <Link href="/dashboard/admin/listings" className="maurie-button-secondary">
          Back to Listings
        </Link>
      </div>

      <div className="mt-8">
        {activeClients.length === 0 ? (
          <FormNotice
            title="No active clients are available."
            message="Activate or create a client account before creating a business listing."
            tone="error"
          />
        ) : (
          <BusinessListingForm
            action={createBusinessListingAction}
            mode="create"
            clients={activeClients}
            initialValues={{
              clientId: activeClients[0]?.id ?? "",
              businessName: "",
              publicSlug: "",
              headline: "",
              description: null,
              websiteUrl: null,
              contactEmail: null,
              contactPhoneE164: null,
              seoTitle: null,
              seoDescription: null,
              isPublished: false
            }}
            cancelHref="/dashboard/admin/listings"
          />
        )}
      </div>
    </AppShell>
  );
}
