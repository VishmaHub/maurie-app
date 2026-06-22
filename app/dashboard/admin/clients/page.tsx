import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminClients } from "@/lib/admin-clients";
import { requireRole } from "@/lib/auth/require-role";
import { formatCurrencyFromCents, formatDate } from "@/lib/formatters";

export default async function AdminClientsPage() {
  const session = await requireRole("ADMIN");

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminClients",
    resourceId: "admin-client-records"
  });

  const clients = await getAdminClients();

  const activeClients = clients.filter((client) => client.isActive);
  const totalProjects = clients.reduce((total, client): number => total + client.projectCount, 0);
  const totalInvoices = clients.reduce((total, client): number => total + client.invoiceCount, 0);
  const outstandingAmountCents = clients.reduce(
    (total, client): number => total + client.outstandingAmountCents,
    0
  );

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Admin Client Records
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Client accounts.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            View client account records, linked projects, invoices, bookings, listings, and account
            status from an admin-only Mauri-E workspace.
          </p>
        </div>

        <Link href="/dashboard/admin" className="maurie-button-secondary">
          Back to Admin
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Clients</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">{clients.length}</p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Active</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {activeClients.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Projects</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">{totalProjects}</p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Invoices</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">{totalInvoices}</p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Outstanding</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--maurie-text)]">
            {formatCurrencyFromCents(outstandingAmountCents, "AUD")}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {clients.length === 0 ? (
          <div className="maurie-glass-soft rounded-3xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              No clients found.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Client accounts will appear here once they are created.
            </p>
          </div>
        ) : (
          clients.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/admin/clients/${client.id}`}
              className="maurie-glass-soft group rounded-3xl p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(89,55,50,0.16)]"
            >
              <article>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                      CLIENT
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--maurie-text)]">
                      {client.displayName}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                      {client.email}
                    </p>
                  </div>

                  <StatusBadge
                    label={client.isActive ? "ACTIVE" : "INACTIVE"}
                    tone={client.isActive ? "yellow" : "neutral"}
                  />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-5">
                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Projects</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {client.projectCount}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Invoices</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {client.invoiceCount}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Bookings</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {client.bookingCount}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Listings</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {client.listingCount}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Created</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDate(client.createdAt)}
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
