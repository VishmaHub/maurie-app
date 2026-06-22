import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminCollaboratorDetail } from "@/lib/admin-collaborators";
import { requireRole } from "@/lib/auth/require-role";
import { formatDate, formatDateTime } from "@/lib/formatters";

interface AdminCollaboratorDetailPageProps {
  readonly params: Promise<{
    readonly collaboratorId: string;
  }>;
}

function getCampaignStatusTone(status: string): "yellow" | "orange" | "neutral" {
  if (status === "ACTIVE" || status === "COMPLETED") {
    return "yellow";
  }

  if (status === "REVIEW" || status === "DRAFT") {
    return "orange";
  }

  return "neutral";
}

export default async function AdminCollaboratorDetailPage(props: AdminCollaboratorDetailPageProps) {
  const session = await requireRole("ADMIN");
  const params = await props.params;

  const collaborator = await getAdminCollaboratorDetail(params.collaboratorId);

  if (collaborator === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "AdminCollaborator",
      resourceId: params.collaboratorId,
      metadata: {
        reason: "collaborator-not-found"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminCollaborator",
    resourceId: collaborator.id
  });

  const campaignAssetCount: number = collaborator.campaignRooms.reduce(
    (total, campaignRoom): number => total + campaignRoom.assets.length,
    0
  );

  const activeCampaignRooms = collaborator.campaignRooms.filter(
    (campaignRoom): boolean => campaignRoom.status === "ACTIVE"
  );

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Collaborator Record
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            {collaborator.profile?.displayName ?? collaborator.email}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            {collaborator.email}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/admin/collaborators" className="maurie-button-secondary">
            Back to Collaborators
          </Link>

          <StatusBadge
            label={collaborator.isActive ? "ACTIVE" : "INACTIVE"}
            tone={collaborator.isActive ? "yellow" : "neutral"}
          />
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Campaign Rooms</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {collaborator.campaignRooms.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Active Rooms</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {activeCampaignRooms.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Campaign Assets</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {campaignAssetCount}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">EOI Submissions</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {collaborator.eoiSubmissions.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Status</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {collaborator.isActive ? "Active" : "Inactive"}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Collaborator Profile
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Normalised Email</p>
              <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                {collaborator.normalizedEmail}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Public Slug</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {collaborator.profile?.publicSlug ?? "Not available"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Profile Visibility</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {collaborator.profile?.isPublic === true ? "Public" : "Private"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Bio</p>
              <p className="mt-1 text-sm leading-6 text-[var(--maurie-text)]">
                {collaborator.profile?.bio ?? "No bio available."}
              </p>
            </div>
          </div>
        </div>

        <aside className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Account Metadata
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">User ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {collaborator.id}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Created</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {formatDateTime(collaborator.createdAt)}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Updated</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {formatDateTime(collaborator.updatedAt)}
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-8 grid gap-4">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Campaign Rooms
          </h2>

          <div className="mt-5 grid gap-3">
            {collaborator.campaignRooms.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No campaign rooms found.</p>
            ) : (
              collaborator.campaignRooms.map((campaignRoom) => (
                <article
                  key={campaignRoom.id}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                        {campaignRoom.campaignCode}
                      </p>

                      <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                        {campaignRoom.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                        {campaignRoom.summary ?? "No campaign summary available."}
                      </p>
                    </div>

                    <StatusBadge
                      label={campaignRoom.status}
                      tone={getCampaignStatusTone(campaignRoom.status)}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/30 p-4">
                      <p className="text-xs text-[var(--maurie-muted)]">Start</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                        {formatDate(campaignRoom.startsAt)}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/30 p-4">
                      <p className="text-xs text-[var(--maurie-muted)]">End</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                        {formatDate(campaignRoom.endsAt)}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/30 p-4">
                      <p className="text-xs text-[var(--maurie-muted)]">Confidential</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                        {campaignRoom.isConfidential ? "Yes" : "No"}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/30 p-4">
                      <p className="text-xs text-[var(--maurie-muted)]">Assets</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                        {campaignRoom.assets.length}
                      </p>
                    </div>
                  </div>

                  {campaignRoom.assets.length > 0 ? (
                    <div className="mt-4 grid gap-3">
                      {campaignRoom.assets.map((asset) => (
                        <div
                          key={asset.id}
                          className="rounded-3xl border border-[var(--maurie-border)] bg-white/30 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                                {asset.assetType}
                              </p>

                              <h4 className="mt-2 text-sm font-semibold text-[var(--maurie-text)]">
                                {asset.title}
                              </h4>

                              <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                                {asset.description ?? "No asset description available."}
                              </p>
                            </div>

                            <StatusBadge
                              label={asset.isVisible ? "VISIBLE" : "HIDDEN"}
                              tone={asset.isVisible ? "yellow" : "neutral"}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Encrypted EOI Submissions
          </h2>

          <div className="mt-5 grid gap-3">
            {collaborator.eoiSubmissions.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">No EOI submissions found.</p>
            ) : (
              collaborator.eoiSubmissions.map((eoiSubmission) => (
                <article
                  key={eoiSubmission.id}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                        {eoiSubmission.referenceCode}
                      </p>

                      <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                        Secure EOI Submission
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                        Payload visibility is restricted. Admin view confirms the existence,
                        ownership, and timestamp only.
                      </p>
                    </div>

                    <StatusBadge label={eoiSubmission.status} tone="yellow" />
                  </div>

                  <p className="mt-3 text-xs text-[var(--maurie-muted)]">
                    Submitted: {formatDateTime(eoiSubmission.createdAt)} · Updated:{" "}
                    {formatDateTime(eoiSubmission.updatedAt)}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
