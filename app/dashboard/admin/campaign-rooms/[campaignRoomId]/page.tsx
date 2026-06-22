import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminCampaignRoomDetail } from "@/lib/admin-campaign-rooms";
import { requireRole } from "@/lib/auth/require-role";
import { formatDate, formatDateTime } from "@/lib/formatters";

interface AdminCampaignRoomDetailPageProps {
  readonly params: Promise<{
    readonly campaignRoomId: string;
  }>;
}

function getCampaignStatusTone(status: string): "yellow" | "orange" | "neutral" {
  if (status === "ACTIVE" || status === "COMPLETED") {
    return "yellow";
  }

  if (status === "DRAFT" || status === "REVIEW") {
    return "orange";
  }

  return "neutral";
}

export default async function AdminCampaignRoomDetailPage(props: AdminCampaignRoomDetailPageProps) {
  const session = await requireRole("ADMIN");
  const params = await props.params;

  const campaignRoom = await getAdminCampaignRoomDetail(params.campaignRoomId);

  if (campaignRoom === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "AdminCampaignRoom",
      resourceId: params.campaignRoomId,
      metadata: {
        reason: "campaign-room-not-found"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminCampaignRoom",
    resourceId: campaignRoom.id
  });

  const visibleAssets = campaignRoom.assets.filter((asset): boolean => asset.isVisible);

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            {campaignRoom.campaignCode}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            {campaignRoom.title}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            {campaignRoom.summary ?? "No campaign summary available."}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/admin/campaign-rooms" className="maurie-button-secondary">
            Back to Campaign Rooms
          </Link>

          <StatusBadge
            label={campaignRoom.status}
            tone={getCampaignStatusTone(campaignRoom.status)}
          />
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Status</p>
          <div className="mt-3">
            <StatusBadge
              label={campaignRoom.status}
              tone={getCampaignStatusTone(campaignRoom.status)}
            />
          </div>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Confidential</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {campaignRoom.isConfidential ? "Yes" : "No"}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Assets</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {campaignRoom.assets.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Visible Assets</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {visibleAssets.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Created</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDateTime(campaignRoom.createdAt)}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Campaign Details
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Campaign Code</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {campaignRoom.campaignCode}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Title</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {campaignRoom.title}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Summary</p>
              <p className="mt-1 text-sm leading-6 text-[var(--maurie-text)]">
                {campaignRoom.summary ?? "No campaign summary available."}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                <p className="text-xs text-[var(--maurie-muted)]">Start</p>
                <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                  {formatDate(campaignRoom.startsAt)}
                </p>
              </div>

              <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                <p className="text-xs text-[var(--maurie-muted)]">End</p>
                <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                  {formatDate(campaignRoom.endsAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Ownership & Metadata
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Collaborator</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {campaignRoom.collaboratorName}
              </p>
              <p className="mt-1 break-words text-xs text-[var(--maurie-muted)]">
                {campaignRoom.collaboratorEmail}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Campaign Room ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {campaignRoom.id}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Collaborator ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {campaignRoom.collaboratorId}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Updated</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {formatDateTime(campaignRoom.updatedAt)}
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-5">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Campaign Assets
        </h2>

        <div className="mt-5 grid gap-3">
          {campaignRoom.assets.length === 0 ? (
            <p className="text-sm text-[var(--maurie-muted)]">No campaign assets found.</p>
          ) : (
            campaignRoom.assets.map((asset) => (
              <article
                key={asset.id}
                className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                      {asset.assetType}
                    </p>

                    <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                      {asset.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                      {asset.description ?? "No asset description available."}
                    </p>
                  </div>

                  <StatusBadge
                    label={asset.isVisible ? "VISIBLE" : "HIDDEN"}
                    tone={asset.isVisible ? "yellow" : "neutral"}
                  />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/30 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Resource URL</p>
                    <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                      {asset.resourceUrl ?? "Not recorded"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/30 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Created</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDateTime(asset.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/30 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Updated</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDateTime(asset.updatedAt)}
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}
