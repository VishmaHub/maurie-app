import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminAuditLogDetail } from "@/lib/admin-audit-logs";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/formatters";

interface AdminAuditLogDetailPageProps {
  readonly params: Promise<{
    readonly auditLogId: string;
  }>;
}

function getAuditActionTone(action: string): "yellow" | "orange" | "neutral" {
  if (action.includes("FAILED") || action.includes("DENIED")) {
    return "orange";
  }

  if (action.includes("SUCCESS") || action.includes("DATA_READ")) {
    return "yellow";
  }

  return "neutral";
}

function stringifyMetadata(metadata: unknown): string {
  if (metadata === null) {
    return "No metadata recorded.";
  }

  if (typeof metadata === "string") {
    return metadata;
  }

  return JSON.stringify(metadata, null, 2);
}

export default async function AdminAuditLogDetailPage(props: AdminAuditLogDetailPageProps) {
  const session = await requireRole("ADMIN");
  const params = await props.params;

  const auditLog = await getAdminAuditLogDetail(params.auditLogId);

  if (auditLog === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "AdminAuditLog",
      resourceId: params.auditLogId,
      metadata: {
        reason: "audit-log-not-found"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminAuditLog",
    resourceId: auditLog.id
  });

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Audit Record
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            {auditLog.action}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            Recorded at {formatDateTime(auditLog.createdAt)}.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/admin/audit-logs" className="maurie-button-secondary">
            Back to Audit Logs
          </Link>

          <StatusBadge label={auditLog.action} tone={getAuditActionTone(auditLog.action)} />
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Actor</p>
          <p className="mt-2 break-words text-xl font-semibold text-[var(--maurie-text)]">
            {auditLog.actorName ?? "System"}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Resource Type</p>
          <p className="mt-2 break-words text-xl font-semibold text-[var(--maurie-text)]">
            {auditLog.resourceType ?? "Not recorded"}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">IP Address</p>
          <p className="mt-2 break-words text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {auditLog.ipAddress ?? "Not recorded"}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Created</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDateTime(auditLog.createdAt)}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Audit Details
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Audit Log ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {auditLog.id}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Actor ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {auditLog.actorId ?? "System or unknown actor"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Actor Email</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {auditLog.actorEmail ?? "Not available"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Resource ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {auditLog.resourceId ?? "Not recorded"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">User Agent</p>
              <p className="mt-1 break-words text-sm leading-6 text-[var(--maurie-text)]">
                {auditLog.userAgent ?? "Not recorded"}
              </p>
            </div>
          </div>
        </div>

        <aside className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Metadata
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--maurie-muted)]">
            Structured audit metadata is displayed here for admin review.
          </p>

          <pre className="mt-5 max-h-[420px] overflow-auto rounded-3xl border border-[var(--maurie-border)] bg-[var(--maurie-black)] p-4 text-xs leading-6 text-[var(--maurie-cream)]">
            {stringifyMetadata(auditLog.metadata)}
          </pre>
        </aside>
      </section>
    </AppShell>
  );
}
