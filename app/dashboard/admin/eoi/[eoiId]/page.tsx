import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminEoiDetail } from "@/lib/admin-eoi";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/formatters";

interface AdminEoiDetailPageProps {
  readonly params: Promise<{
    readonly eoiId: string;
  }>;
}

export default async function AdminEoiDetailPage(props: AdminEoiDetailPageProps) {
  const session = await requireRole("ADMIN");
  const params = await props.params;

  const submission = await getAdminEoiDetail(params.eoiId);

  if (submission === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "AdminEOI",
      resourceId: params.eoiId,
      metadata: {
        reason: "eoi-not-found"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminEOI",
    resourceId: submission.id
  });

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            {submission.referenceCode}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Secure EOI Submission
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            This record confirms an encrypted EOI submission from {submission.collaboratorName}.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/admin/eoi" className="maurie-button-secondary">
            Back to EOI
          </Link>

          <StatusBadge label={submission.status} tone="yellow" />
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Status</p>
          <div className="mt-3">
            <StatusBadge label={submission.status} tone="yellow" />
          </div>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Payload</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {submission.payloadVisibility}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Submitted</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDateTime(submission.createdAt)}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Updated</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDateTime(submission.updatedAt)}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Collaborator Ownership
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Collaborator</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {submission.collaboratorName}
              </p>
              <p className="mt-1 break-words text-xs text-[var(--maurie-muted)]">
                {submission.collaboratorEmail}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Collaborator ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {submission.collaboratorId}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Reference Code</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {submission.referenceCode}
              </p>
            </div>
          </div>
        </div>

        <aside className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Security Controls
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Payload Visibility</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">Restricted</p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Admin Display</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">Metadata only</p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Storage Status</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                Securely stored
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-5">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Security Note
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
          {submission.securityNote}
        </p>
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-5">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          EOI Metadata
        </h2>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">EOI ID</p>
            <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
              {submission.id}
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">Status</p>
            <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
              {submission.status}
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
