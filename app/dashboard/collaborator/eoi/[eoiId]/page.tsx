import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { getCollaboratorEoiDetail } from "@/lib/collaborator-eoi";
import { formatDateTime } from "@/lib/formatters";

interface CollaboratorEoiDetailPageProps {
  readonly params: Promise<{
    readonly eoiId: string;
  }>;
}

export default async function CollaboratorEoiDetailPage(props: CollaboratorEoiDetailPageProps) {
  const session = await requireRole("COLLABORATOR");
  const params = await props.params;

  const submission = await getCollaboratorEoiDetail({
    userId: session.userId,
    eoiId: params.eoiId
  });

  if (submission === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "EoiSubmission",
      resourceId: params.eoiId,
      metadata: {
        reason: "eoi-not-found-or-not-owned"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "COLLABORATOR_DATA_READ",
    resourceType: "EoiSubmission",
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
            {submission.title}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            This EOI is stored as a protected record. Sensitive payload details remain encrypted and
            are intentionally not displayed in the collaborator interface.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/collaborator/eoi" className="maurie-button-secondary">
            Back to EOI
          </Link>

          <StatusBadge label={submission.status} tone="yellow" />
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Reference</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {submission.referenceCode}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Status</p>
          <div className="mt-3">
            <StatusBadge label={submission.status} tone="yellow" />
          </div>
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
            Secure Submission Record
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Submission Type</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                Expression of Interest
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Payload Visibility</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                Encrypted and hidden from UI
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Access Rule</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                Only the owning collaborator can view this record.
              </p>
            </div>
          </div>
        </div>

        <aside className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Compliance Notes
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--maurie-muted)]">
            This module is prepared for secure EOI, investment interest, collaboration applications,
            and controlled-access campaign workflows. Future phases can add review statuses,
            approval workflows, admin notes, and secure document storage.
          </p>

          <div className="mt-5 rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">Security Layer</p>
            <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
              Role-based access control active
            </p>
          </div>

          <div className="mt-5 rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">Audit Logging</p>
            <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
              View activity recorded
            </p>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
