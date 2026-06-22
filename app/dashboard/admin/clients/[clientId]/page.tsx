import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminClientDetail } from "@/lib/admin-clients";
import { requireRole } from "@/lib/auth/require-role";
import { formatCurrencyFromCents, formatDate, formatDateTime } from "@/lib/formatters";

interface AdminClientDetailPageProps {
  readonly params: Promise<{
    readonly clientId: string;
  }>;
}

export default async function AdminClientDetailPage(props: AdminClientDetailPageProps) {
  const session = await requireRole("ADMIN");
  const params = await props.params;

  const client = await getAdminClientDetail(params.clientId);

  if (client === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "AdminClient",
      resourceId: params.clientId,
      metadata: {
        reason: "client-not-found"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminClient",
    resourceId: client.id
  });

  const outstandingAmountCents: number = client.invoices
    .filter((invoice): boolean => invoice.paymentStatus !== "PAID")
    .reduce((total, invoice): number => total + invoice.amountCents, 0);

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Client Record
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            {client.profile?.displayName ?? client.email}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            {client.email}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/admin/clients" className="maurie-button-secondary">
            Back to Clients
          </Link>

          <StatusBadge
            label={client.isActive ? "ACTIVE" : "INACTIVE"}
            tone={client.isActive ? "yellow" : "neutral"}
          />
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Projects</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {client.projects.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Invoices</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {client.invoices.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Bookings</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {client.bookings.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Listings</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {client.businessListings.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Outstanding</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--maurie-text)]">
            {formatCurrencyFromCents(outstandingAmountCents, "AUD")}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Client Profile
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Normalised Email</p>
              <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                {client.normalizedEmail}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Public Slug</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {client.profile?.publicSlug ?? "Not available"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Profile Visibility</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {client.profile?.isPublic === true ? "Public" : "Private"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Bio</p>
              <p className="mt-1 text-sm leading-6 text-[var(--maurie-text)]">
                {client.profile?.bio ?? "No bio available."}
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
                {client.id}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Created</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {formatDateTime(client.createdAt)}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Updated</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {formatDateTime(client.updatedAt)}
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-8 grid gap-4">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Projects
          </h2>

          <div className="mt-5 grid gap-3">
            {client.projects.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No projects found.</p>
            ) : (
              client.projects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                    {project.projectCode}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                    {project.summary ?? "No summary available."}
                  </p>
                  <p className="mt-3 text-xs text-[var(--maurie-muted)]">
                    Status: {project.status} · {formatDate(project.startsAt)} →{" "}
                    {formatDate(project.endsAt)}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Invoices
          </h2>

          <div className="mt-5 grid gap-3">
            {client.invoices.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No invoices found.</p>
            ) : (
              client.invoices.map((invoice) => (
                <article
                  key={invoice.id}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                        {invoice.invoiceNumber}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                        {formatCurrencyFromCents(invoice.amountCents, invoice.currency)}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--maurie-muted)]">
                        {invoice.projectCode} · {invoice.projectTitle}
                      </p>
                    </div>

                    <StatusBadge label={invoice.paymentStatus} tone="orange" />
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Business Listings
          </h2>

          <div className="mt-5 grid gap-3">
            {client.businessListings.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No business listings found.</p>
            ) : (
              client.businessListings.map((listing) => (
                <article
                  key={listing.id}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                        /l/{listing.publicSlug}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                        {listing.businessName}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                        {listing.headline}
                      </p>
                    </div>

                    <StatusBadge
                      label={listing.isPublished ? "PUBLISHED" : "DRAFT"}
                      tone={listing.isPublished ? "yellow" : "neutral"}
                    />
                  </div>

                  <p className="mt-3 text-xs text-[var(--maurie-muted)]">
                    Offers: {listing.offerCount}
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
