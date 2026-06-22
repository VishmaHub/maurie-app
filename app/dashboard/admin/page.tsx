import { AppShell } from "@/components/layout/app-shell";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { requireRole } from "@/lib/auth/require-role";

interface AdminMetricCardProps {
  readonly label: string;
  readonly value: number;
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

export default async function AdminDashboardPage() {
  const session = await requireRole("ADMIN");

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminDashboard",
    resourceId: "admin-foundation"
  });

  const data = await getAdminDashboardData();

  return (
    <AppShell role={session.role}>
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
          Mauri-E Admin
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Internal admin foundation.
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
          This admin area is prepared for internal Mauri-E operations. It is protected by role-based
          access control and is not available to client, creative, or collaborator users.
        </p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <AdminMetricCard
          label="Total Users"
          value={data.totalUsers}
          description="All registered platform users."
        />

        <AdminMetricCard
          label="Active Users"
          value={data.activeUsers}
          description="Users currently marked as active."
        />

        <AdminMetricCard label="Clients" value={data.clients} description="Client role users." />

        <AdminMetricCard
          label="Creatives"
          value={data.creatives}
          description="Creative role users."
        />

        <AdminMetricCard
          label="Collaborators"
          value={data.collaborators}
          description="Collaborator role users."
        />

        <AdminMetricCard label="Admins" value={data.admins} description="Admin role users." />

        <AdminMetricCard
          label="Projects"
          value={data.projects}
          description="Client project records."
        />

        <AdminMetricCard
          label="Invoices"
          value={data.invoices}
          description="Client invoice records."
        />

        <AdminMetricCard
          label="Bookings"
          value={data.bookings}
          description="Creative booking records."
        />

        <AdminMetricCard
          label="EOI Submissions"
          value={data.eoiSubmissions}
          description="Encrypted collaborator EOI records."
        />

        <AdminMetricCard
          label="Campaign Rooms"
          value={data.campaignRooms}
          description="Collaborator campaign room records."
        />

        <AdminMetricCard
          label="Business Listings"
          value={data.businessListings}
          description="Client listing hub records."
        />

        <AdminMetricCard
          label="Creative Profiles"
          value={data.creativeProfiles}
          description="Public creative profile records."
        />

        <AdminMetricCard
          label="Audit Logs"
          value={data.auditLogs}
          description="Security and access activity records."
        />
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-6">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Admin preparation status
        </h2>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">RBAC</p>
            <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
              Admin-only access active
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">Audit Logging</p>
            <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
              Admin dashboard views recorded
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">Exposure</p>
            <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
              Hidden from non-admin roles
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
