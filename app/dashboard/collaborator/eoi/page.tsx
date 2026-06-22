import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { getCollaboratorEoiSubmissions } from "@/lib/collaborator-eoi";
import { formatDateTime } from "@/lib/formatters";

export default async function CollaboratorEoiPage() {
  const session = await requireRole("COLLABORATOR");

  await writeAuditLog({
    actorId: session.userId,
    action: "COLLABORATOR_DATA_READ",
    resourceType: "CollaboratorEOI",
    resourceId: "collaborator-eoi-list"
  });

  const submissions = await getCollaboratorEoiSubmissions(session.userId);

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Collaborator EOI
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Expression of interest hub.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            View your submitted EOI records in a secure collaborator workspace. Sensitive submission
            payloads are encrypted and are not displayed in the interface.
          </p>
        </div>

        <Link href="/dashboard/collaborator" className="maurie-button-secondary">
          Back to Dashboard
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Total Submissions</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {submissions.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Security</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">Encrypted</p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Access</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">Collaborator-only</p>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {submissions.length === 0 ? (
          <div className="maurie-glass-soft rounded-3xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              No EOI submissions found.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Once an EOI is submitted under your collaborator account, it will appear here.
            </p>
          </div>
        ) : (
          submissions.map((submission) => (
            <Link
              key={submission.id}
              href={`/dashboard/collaborator/eoi/${submission.id}`}
              className="maurie-glass-soft group rounded-3xl p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(89,55,50,0.16)]"
            >
              <article>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                      {submission.referenceCode}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--maurie-text)]">
                      {submission.title}
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
                      This EOI record is stored securely. The encrypted submission payload is not
                      exposed on this page.
                    </p>
                  </div>

                  <StatusBadge label={submission.status} tone="yellow" />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Submitted</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDateTime(submission.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Updated</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDateTime(submission.updatedAt)}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Payload</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      Encrypted
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
