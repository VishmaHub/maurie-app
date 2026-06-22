import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { requireRole } from "@/lib/auth/require-role";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";

interface AdminMetricCardProps {
  readonly label: string;
  readonly value: string | number;
  readonly description: string;
}

interface AdminQuickLinkProps {
  readonly href: string;
  readonly label: string;
  readonly description: string;
}

function AdminMetricCard(props: AdminMetricCardProps) {
  return (
    <div className="maurie-glass-soft rounded-3xl p-5">
      <p className="text-sm text-[var(--maurie-muted)]">{props.label}</p>
      <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">{props.value}</p>
      <p className="mt-2 text-xs leading-5 text-[var(--maurie-muted)]">{props.description}</p>
    </div>
  );
}

function AdminQuickLink(props: AdminQuickLinkProps) {
  return (
    <Link
      href={props.href}
      className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4 transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/55"
    >
      <p className="text-sm font-semibold text-[var(--maurie-text)]">{props.label}</p>
      <p className="mt-2 text-xs leading-5 text-[var(--maurie-muted)]">{props.description}</p>
    </Link>
  );
}

function getStatusTone(status: string): "yellow" | "orange" | "neutral" {
  if (status === "ACTIVE" || status === "COMPLETED" || status === "PAID") {
    return "yellow";
  }

  if (status === "REVIEW" || status === "ISSUED" || status === "OVERDUE") {
    return "orange";
  }

  return "neutral";
}

export default async function AdminDashboardPage() {
  const session = await requireRole("ADMIN");

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminDashboard",
    resourceId: "admin-operational-dashboard"
  });

  const data = await getAdminDashboardData();

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Mauri-E Admin Command Centre
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Operational overview.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            Monitor platform activity, users, clients, creatives, collaborators, projects, invoices,
            bookings, listings, campaign rooms, secure EOI submissions, and recent security events.
          </p>
        </div>

        <Link href="/dashboard/admin/search" className="maurie-button-primary">
          Search Platform
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <AdminMetricCard
          label="Users"
          value={data.users.total}
          description={`${data.users.active} active · ${data.users.admins} admin`}
        />

        <AdminMetricCard
          label="Clients"
          value={data.users.clients}
          description="Client accounts in the platform."
        />

        <AdminMetricCard
          label="Creatives"
          value={data.users.creatives}
          description="Creative accounts and delivery operators."
        />

        <AdminMetricCard
          label="Collaborators"
          value={data.users.collaborators}
          description="Campaign and EOI collaborators."
        />
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-4">
        <AdminMetricCard
          label="Projects"
          value={data.projects.total}
          description={`${data.projects.active} active · ${data.projects.completed} completed`}
        />

        <AdminMetricCard
          label="Invoices"
          value={data.invoices.total}
          description={`${data.invoices.paid} paid · ${data.invoices.outstanding} outstanding`}
        />

        <AdminMetricCard
          label="Bookings"
          value={data.bookings.total}
          description={`${data.bookings.upcoming} upcoming · ${data.bookings.completed} completed`}
        />

        <AdminMetricCard
          label="Audit Logs"
          value={data.auditLogs.total}
          description="Security and access activity records."
        />
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-4">
        <AdminMetricCard
          label="Invoice Value"
          value={formatCurrencyFromCents(data.invoices.totalAmountCents, "AUD")}
          description="Total invoice value recorded."
        />

        <AdminMetricCard
          label="Outstanding"
          value={formatCurrencyFromCents(data.invoices.outstandingAmountCents, "AUD")}
          description="Unpaid or not fully paid invoice value."
        />

        <AdminMetricCard
          label="GST"
          value={formatCurrencyFromCents(data.invoices.gstAmountCents, "AUD")}
          description="GST amount recorded across invoices."
        />

        <AdminMetricCard
          label="Listings"
          value={data.listings.total}
          description={`${data.listings.published} published · ${data.listings.drafts} draft`}
        />
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        <AdminMetricCard
          label="Campaign Rooms"
          value={data.campaignRooms.total}
          description={`${data.campaignRooms.active} active · ${data.campaignRooms.confidential} confidential`}
        />

        <AdminMetricCard
          label="EOI Submissions"
          value={data.eoi.total}
          description="Encrypted EOI records stored."
        />

        <AdminMetricCard
          label="Cancelled Bookings"
          value={data.bookings.cancelled}
          description="Cancelled or declined booking records."
        />
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              Quick actions
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Jump into the main admin record areas.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <AdminQuickLink
            href="/dashboard/admin/search"
            label="Search"
            description="Find users, projects, invoices, listings, campaigns, and EOI records."
          />
          <AdminQuickLink
            href="/dashboard/admin/users"
            label="Users"
            description="Review all platform users and role assignments."
          />
          <AdminQuickLink
            href="/dashboard/admin/clients"
            label="Clients"
            description="Review client accounts and linked records."
          />
          <AdminQuickLink
            href="/dashboard/admin/creatives"
            label="Creatives"
            description="Review creative accounts, portfolios, and bookings."
          />
          <AdminQuickLink
            href="/dashboard/admin/collaborators"
            label="Collaborators"
            description="Review collaborators, campaign rooms, and EOI records."
          />
          <AdminQuickLink
            href="/dashboard/admin/projects"
            label="Projects"
            description="Review project operations and milestones."
          />
          <AdminQuickLink
            href="/dashboard/admin/invoices"
            label="Invoices"
            description="Review invoice records and payment status."
          />
          <AdminQuickLink
            href="/dashboard/admin/audit-logs"
            label="Audit Logs"
            description="Review access and security events."
          />
        </div>
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-2">
        <div className="maurie-glass-soft rounded-3xl p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Recent projects
          </h2>

          <div className="mt-5 grid gap-3">
            {data.recentProjects.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No recent projects found.</p>
            ) : (
              data.recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/admin/projects/${project.id}`}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                        {project.projectCode}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                        {project.title}
                      </p>
                      <p className="mt-1 text-xs text-[var(--maurie-muted)]">
                        Client: {project.clientName}
                      </p>
                    </div>

                    <StatusBadge label={project.status} tone={getStatusTone(project.status)} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Recent invoices
          </h2>

          <div className="mt-5 grid gap-3">
            {data.recentInvoices.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No recent invoices found.</p>
            ) : (
              data.recentInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/dashboard/admin/invoices/${invoice.id}`}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                        {invoice.invoiceNumber}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                        {formatCurrencyFromCents(invoice.amountCents, invoice.currency)}
                      </p>
                      <p className="mt-1 text-xs text-[var(--maurie-muted)]">
                        Client: {invoice.clientName}
                      </p>
                    </div>

                    <StatusBadge
                      label={invoice.paymentStatus}
                      tone={getStatusTone(invoice.paymentStatus)}
                    />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-2">
        <div className="maurie-glass-soft rounded-3xl p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Upcoming bookings
          </h2>

          <div className="mt-5 grid gap-3">
            {data.upcomingBookings.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No upcoming bookings found.</p>
            ) : (
              data.upcomingBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/dashboard/admin/bookings/${booking.id}`}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                    {formatDateTime(booking.scheduledTime)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                    Booking with {booking.clientName}
                  </p>
                  <p className="mt-1 text-xs text-[var(--maurie-muted)]">
                    {booking.clientEmail} · {booking.durationMinutes} mins · {booking.status}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Recent audit activity
          </h2>

          <div className="mt-5 grid gap-3">
            {data.auditLogs.recent.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No audit logs found.</p>
            ) : (
              data.auditLogs.recent.map((auditLog) => (
                <Link
                  key={auditLog.id}
                  href={`/dashboard/admin/audit-logs/${auditLog.id}`}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                    {formatDateTime(auditLog.timestamp)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                    {auditLog.action}
                  </p>
                  <p className="mt-1 text-xs text-[var(--maurie-muted)]">
                    {auditLog.resourceType ?? "No resource"} ·{" "}
                    {auditLog.resourceId ?? "No resource ID"}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
