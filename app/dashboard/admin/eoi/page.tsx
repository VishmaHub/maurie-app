import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminEoiSubmissions } from "@/lib/admin-eoi";
import { requireRole } from "@/lib/auth/require-role";
import { formatDate, formatDateTime } from "@/lib/formatters";

export default async function AdminEoiPage() {
  const session = await requireRole("ADMIN");

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminEOI",
    resourceId: "admin-eoi-records"
  });

  const submissions = await getAdminEoiSubmissions();

  const uniqueCollaboratorIds: string[] = Array.from(
    new Set(submissions.map((submission): string => submission.collaboratorId))
  );

  const secureSubmissions = submissions.filter(
    (submission): boolean => submission.status === "SECURELY_STORED"
  );

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Admin EOI Records
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Secure EOI submissions.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            View encrypted collaborator EOI submission records, ownership metadata, timestamps, and
            secure storage status from an admin-only Mauri-E workspace.
          </p>
        </div>

        <Link href="/dashboard/admin" className="maurie-button-secondary">
          Back to Admin
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">EOI Submissions</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {submissions.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Collaborators</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {uniqueCollaboratorIds.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Securely Stored</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {secureSubmissions.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Payload View</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">Restricted</p>
        </div>
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-5">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Security Notice
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
          EOI records may contain sensitive investment or collaboration information. The admin
          interface displays only reference, ownership, and timestamp metadata. Encrypted payload
          contents remain hidden.
        </p>
      </section>

      <section className="mt-8 grid gap-4">
        {submissions.length === 0 ? (
          <div className="maurie-glass-soft rounded-3xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              No EOI submissions found.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              EOI records will appear here once collaborators submit secure expressions of interest.
            </p>
          </div>
        ) : (
          submissions.map((submission) => (
            <Link
              key={submission.id}
              href={`/dashboard/admin/eoi/${submission.id}`}
              className="maurie-glass-soft group rounded-3xl p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(89,55,50,0.16)]"
            >
              <article>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                      {submission.referenceCode}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--maurie-text)]">
                      Secure EOI Submission
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
                      Collaborator: {submission.collaboratorName} · {submission.collaboratorEmail}
                    </p>
                  </div>

                  <StatusBadge label={submission.status} tone="yellow" />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-5">
                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Collaborator</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {submission.collaboratorName}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Payload</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {submission.payloadVisibility}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Status</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {submission.status}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Submitted</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDate(submission.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Updated</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDateTime(submission.updatedAt)}
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
