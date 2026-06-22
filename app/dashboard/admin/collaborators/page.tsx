import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminCollaborators } from "@/lib/admin-collaborators";
import { requireRole } from "@/lib/auth/require-role";
import { formatDate } from "@/lib/formatters";

export default async function AdminCollaboratorsPage() {
  const session = await requireRole("ADMIN");

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminCollaborators",
    resourceId: "admin-collaborator-records"
  });

  const collaborators = await getAdminCollaborators();

  const activeCollaborators = collaborators.filter((collaborator) => collaborator.isActive);

  const totalCampaignRooms = collaborators.reduce(
    (total, collaborator): number => total + collaborator.campaignRoomCount,
    0
  );

  const totalActiveCampaignRooms = collaborators.reduce(
    (total, collaborator): number => total + collaborator.activeCampaignRoomCount,
    0
  );

  const totalCampaignAssets = collaborators.reduce(
    (total, collaborator): number => total + collaborator.campaignAssetCount,
    0
  );

  const totalEoiSubmissions = collaborators.reduce(
    (total, collaborator): number => total + collaborator.eoiSubmissionCount,
    0
  );

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Admin Collaborator Records
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Collaborator accounts.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            View collaborator accounts, campaign rooms, secure EOI submissions, campaign assets, and
            linked collaboration records from an admin-only Mauri-E workspace.
          </p>
        </div>

        <Link href="/dashboard/admin" className="maurie-button-secondary">
          Back to Admin
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Collaborators</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {collaborators.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Active</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {activeCollaborators.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Campaign Rooms</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {totalCampaignRooms}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Active Rooms</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {totalActiveCampaignRooms}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">EOI Submissions</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {totalEoiSubmissions}
          </p>
        </div>
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-5">
        <p className="text-sm text-[var(--maurie-muted)]">Campaign Assets</p>
        <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
          {totalCampaignAssets}
        </p>
      </section>

      <section className="mt-8 grid gap-4">
        {collaborators.length === 0 ? (
          <div className="maurie-glass-soft rounded-3xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              No collaborators found.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Collaborator accounts will appear here once they are created.
            </p>
          </div>
        ) : (
          collaborators.map((collaborator) => (
            <Link
              key={collaborator.id}
              href={`/dashboard/admin/collaborators/${collaborator.id}`}
              className="maurie-glass-soft group rounded-3xl p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(89,55,50,0.16)]"
            >
              <article>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                      COLLABORATOR
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--maurie-text)]">
                      {collaborator.displayName}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                      {collaborator.email}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <StatusBadge
                      label={collaborator.isActive ? "ACTIVE" : "INACTIVE"}
                      tone={collaborator.isActive ? "yellow" : "neutral"}
                    />

                    <StatusBadge
                      label={
                        collaborator.activeCampaignRoomCount > 0
                          ? "ACTIVE CAMPAIGN"
                          : "NO ACTIVE CAMPAIGN"
                      }
                      tone={collaborator.activeCampaignRoomCount > 0 ? "yellow" : "neutral"}
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-5">
                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Campaign Rooms</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {collaborator.campaignRoomCount}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Active Rooms</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {collaborator.activeCampaignRoomCount}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Assets</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {collaborator.campaignAssetCount}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">EOI</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {collaborator.eoiSubmissionCount}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Created</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDate(collaborator.createdAt)}
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
