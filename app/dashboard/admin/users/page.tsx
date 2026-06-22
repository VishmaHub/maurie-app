import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminUsers } from "@/lib/admin-users";
import { requireRole } from "@/lib/auth/require-role";
import { formatDate } from "@/lib/formatters";

function getRoleTone(role: string): "yellow" | "orange" | "neutral" {
  if (role === "ADMIN") {
    return "orange";
  }

  if (role === "CLIENT") {
    return "yellow";
  }

  return "neutral";
}

export default async function AdminUsersPage() {
  const session = await requireRole("ADMIN");

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminUsers",
    resourceId: "admin-user-directory"
  });

  const users = await getAdminUsers();

  const activeUsers = users.filter((user) => user.isActive);
  const adminUsers = users.filter((user) => user.role === "ADMIN");
  const clientUsers = users.filter((user) => user.role === "CLIENT");
  const creativeUsers = users.filter((user) => user.role === "CREATIVE");
  const collaboratorUsers = users.filter((user) => user.role === "COLLABORATOR");

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Admin User Directory
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Platform users.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            View Mauri-E platform users, roles, account status, profile metadata, and user detail
            records from an admin-only workspace.
          </p>
        </div>

        <Link href="/dashboard/admin" className="maurie-button-secondary">
          Back to Admin
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Total Users</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">{users.length}</p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Active</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {activeUsers.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Clients</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {clientUsers.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Creatives</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {creativeUsers.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Collaborators</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {collaboratorUsers.length}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {adminUsers.length > 0 ? (
          <div className="maurie-glass-soft rounded-3xl p-5">
            <p className="text-sm font-semibold text-[var(--maurie-text)]">
              Admin users: {adminUsers.length}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Admin accounts are internal and should remain limited to trusted Mauri-E operators.
            </p>
          </div>
        ) : null}

        {users.map((user) => (
          <Link
            key={user.id}
            href={`/dashboard/admin/users/${user.id}`}
            className="maurie-glass-soft group rounded-3xl p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(89,55,50,0.16)]"
          >
            <article>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                    {user.role}
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--maurie-text)]">
                    {user.displayName}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">{user.email}</p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <StatusBadge label={user.role} tone={getRoleTone(user.role)} />
                  <StatusBadge
                    label={user.isActive ? "ACTIVE" : "INACTIVE"}
                    tone={user.isActive ? "yellow" : "neutral"}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                  <p className="text-xs text-[var(--maurie-muted)]">Public Slug</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                    {user.publicSlug ?? "Not available"}
                  </p>
                </div>

                <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                  <p className="text-xs text-[var(--maurie-muted)]">Created</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                    {formatDate(user.createdAt)}
                  </p>
                </div>

                <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                  <p className="text-xs text-[var(--maurie-muted)]">Updated</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                    {formatDate(user.updatedAt)}
                  </p>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
