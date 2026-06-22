import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminAuditLogs } from "@/lib/admin-audit-logs";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/formatters";

function getAuditActionTone(action: string): "yellow" | "orange" | "neutral" {
  if (action.includes("FAILED") || action.includes("DENIED")) {
    return "orange";
  }

  if (action.includes("SUCCESS") || action.includes("DATA_READ")) {
    return "yellow";
  }

  return "neutral";
}

export default async function AdminAuditLogsPage() {
  const session = await requireRole("ADMIN");

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminAuditLogs",
    resourceId: "admin-audit-log-list"
  });

  const auditLogs = await getAdminAuditLogs();

  const deniedLogs = auditLogs.filter((auditLog) => auditLog.action.includes("DENIED"));
  const failedLogs = auditLogs.filter((auditLog) => auditLog.action.includes("FAILED"));
  const loginLogs = auditLogs.filter((auditLog) => auditLog.action.includes("LOGIN"));

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Admin Audit Logs
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Security activity.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            Review recent Mauri-E platform access events, role-protected activity, login attempts,
            denied access events, and resource-level audit records.
          </p>
        </div>

        <Link href="/dashboard/admin" className="maurie-button-secondary">
          Back to Admin
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Recent Logs</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {auditLogs.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Login Events</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {loginLogs.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Denied Access</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {deniedLogs.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Failed Events</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {failedLogs.length}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {auditLogs.length === 0 ? (
          <div className="maurie-glass-soft rounded-3xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              No audit logs found.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Audit activity will appear here after users access protected platform areas.
            </p>
          </div>
        ) : (
          auditLogs.map((auditLog) => (
            <Link
              key={auditLog.id}
              href={`/dashboard/admin/audit-logs/${auditLog.id}`}
              className="maurie-glass-soft group rounded-3xl p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(89,55,50,0.16)]"
            >
              <article>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                      {formatDateTime(auditLog.createdAt)}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--maurie-text)]">
                      {auditLog.action}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                      Actor: {auditLog.actorName ?? "System or unknown actor"}
                    </p>
                  </div>

                  <StatusBadge label={auditLog.action} tone={getAuditActionTone(auditLog.action)} />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Resource Type</p>
                    <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                      {auditLog.resourceType ?? "Not recorded"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Resource ID</p>
                    <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                      {auditLog.resourceId ?? "Not recorded"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">IP Address</p>
                    <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                      {auditLog.ipAddress ?? "Not recorded"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Actor Email</p>
                    <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                      {auditLog.actorEmail ?? "Not available"}
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
