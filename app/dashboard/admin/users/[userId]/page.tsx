import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminUserDetail } from "@/lib/admin-users";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/formatters";
import { UserStatusControl } from "@/components/admin/user-status-control";

interface AdminUserDetailPageProps {
  readonly params: Promise<{
    readonly userId: string;
  }>;
  readonly searchParams: Promise<{
    readonly status?: string;
  }>;
}

interface CountCardProps {
  readonly label: string;
  readonly value: number;
}

interface UserStatusNotice {
  readonly title: string;
  readonly description: string;
  readonly tone: "yellow" | "orange" | "neutral";
}

function getUserStatusNotice(status: string | undefined): UserStatusNotice | null {
  if (status === "updated") {
    return {
      title: "User status updated.",
      description: "The user account status was updated successfully.",
      tone: "yellow"
    };
  }

  if (status === "self-lock-blocked") {
    return {
      title: "Action blocked.",
      description: "You cannot deactivate your own admin account.",
      tone: "orange"
    };
  }

  if (status === "invalid") {
    return {
      title: "Invalid request.",
      description: "The submitted user status request was invalid.",
      tone: "orange"
    };
  }

  if (status === "not-found") {
    return {
      title: "User not found.",
      description: "The requested user account could not be found.",
      tone: "orange"
    };
  }

  return null;
}

function CountCard(props: CountCardProps) {
  return (
    <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
      <p className="text-xs text-[var(--maurie-muted)]">{props.label}</p>
      <p className="mt-1 text-xl font-semibold text-[var(--maurie-text)]">{props.value}</p>
    </div>
  );
}

function getRoleTone(role: string): "yellow" | "orange" | "neutral" {
  if (role === "ADMIN") {
    return "orange";
  }

  if (role === "CLIENT") {
    return "yellow";
  }

  return "neutral";
}

export default async function AdminUserDetailPage(props: AdminUserDetailPageProps) {
  const session = await requireRole("ADMIN");
  const params = await props.params;

  const searchParams = await props.searchParams;
  const notice = getUserStatusNotice(searchParams.status);

  const user = await getAdminUserDetail(params.userId);

  if (user === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "AdminUser",
      resourceId: params.userId,
      metadata: {
        reason: "admin-user-not-found"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminUser",
    resourceId: user.id
  });

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            {user.role}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            {user.profile?.displayName ?? user.email}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            {user.email}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/admin/users" className="maurie-button-secondary">
            Back to Users
          </Link>

          <StatusBadge label={user.role} tone={getRoleTone(user.role)} />

          <StatusBadge
            label={user.isActive ? "ACTIVE" : "INACTIVE"}
            tone={user.isActive ? "yellow" : "neutral"}
          />
        </div>
      </div>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              User Status Control
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
              Activate or deactivate this user account. Deactivated users remain in the database for
              audit and historical reporting.
            </p>
          </div>

          <StatusBadge
            label={user.isActive ? "ACTIVE" : "INACTIVE"}
            tone={user.isActive ? "yellow" : "neutral"}
          />
        </div>

        <div className="mt-5">
          <UserStatusControl
            userId={user.id}
            isActive={user.isActive}
            isSelf={user.id === session.userId}
            returnPath={`/dashboard/admin/users/${user.id}`}
          />
        </div>
      </section>

      {notice === null ? null : (
        <section className="maurie-glass-soft mt-8 rounded-3xl p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
                {notice.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                {notice.description}
              </p>
            </div>

            <StatusBadge label={searchParams.status ?? "STATUS"} tone={notice.tone} />
          </div>
        </section>
      )}

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Role</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">{user.role}</p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Status</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {user.isActive ? "Active" : "Inactive"}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Created</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDateTime(user.createdAt)}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Updated</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDateTime(user.updatedAt)}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Profile Details
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Email</p>
              <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                {user.email}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Normalised Email</p>
              <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                {user.normalizedEmail}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Public Slug</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {user.profile?.publicSlug ?? "Not available"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Public Profile</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {user.profile?.isPublic === true ? "Public" : "Private"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Bio</p>
              <p className="mt-1 text-sm leading-6 text-[var(--maurie-text)]">
                {user.profile?.bio ?? "No bio available."}
              </p>
            </div>
          </div>
        </div>

        <aside className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Linked Records
          </h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <CountCard label="Client Projects" value={user.counts.projectsAsClient} />
            <CountCard label="Creative Projects" value={user.counts.projectsAsCreative} />
            <CountCard label="Invoices" value={user.counts.invoices} />
            <CountCard label="Client Bookings" value={user.counts.bookingsAsClient} />
            <CountCard label="Creative Bookings" value={user.counts.bookingsAsCreative} />
            <CountCard label="EOI Submissions" value={user.counts.eoiSubmissions} />
            <CountCard label="Business Listings" value={user.counts.businessListings} />
            <CountCard label="Creative Profiles" value={user.counts.creativeProfiles} />
            <CountCard label="Portfolio Items" value={user.counts.creativePortfolioItems} />
            <CountCard label="Campaign Rooms" value={user.counts.campaignRooms} />
            <CountCard label="Audit Logs" value={user.counts.auditLogs} />
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
