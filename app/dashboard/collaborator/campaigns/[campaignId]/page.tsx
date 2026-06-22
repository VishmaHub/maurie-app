import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { getCollaboratorCampaignDetail } from "@/lib/collaborator-campaigns";
import { formatDate, formatDateTime } from "@/lib/formatters";

interface CollaboratorCampaignDetailPageProps {
  readonly params: Promise<{
    readonly campaignId: string;
  }>;
}

function getCampaignStatusTone(status: string): "yellow" | "orange" | "neutral" {
  if (status === "ACTIVE" || status === "COMPLETED") {
    return "yellow";
  }

  if (status === "REVIEW") {
    return "orange";
  }

  return "neutral";
}

export default async function CollaboratorCampaignDetailPage(
  props: CollaboratorCampaignDetailPageProps
) {
  const session = await requireRole("COLLABORATOR");
  const params = await props.params;

  const campaign = await getCollaboratorCampaignDetail({
    userId: session.userId,
    campaignId: params.campaignId
  });

  if (campaign === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "CampaignRoom",
      resourceId: params.campaignId,
      metadata: {
        reason: "campaign-not-found-or-not-owned"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "COLLABORATOR_DATA_READ",
    resourceType: "CampaignRoom",
    resourceId: campaign.id
  });

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            {campaign.campaignCode}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            {campaign.title}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            {campaign.summary ?? "No campaign summary has been added yet."}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/collaborator/campaigns" className="maurie-button-secondary">
            Back to Campaigns
          </Link>

          <StatusBadge label={campaign.status} tone={getCampaignStatusTone(campaign.status)} />
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Status</p>
          <div className="mt-3">
            <StatusBadge label={campaign.status} tone={getCampaignStatusTone(campaign.status)} />
          </div>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Confidential</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {campaign.isConfidential ? "Yes" : "No"}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Start</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDate(campaign.startsAt)}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">End</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDate(campaign.endsAt)}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Campaign Assets
          </h2>

          <div className="mt-5 grid gap-3">
            {campaign.assets.length === 0 ? (
              <p className="text-sm text-[var(--maurie-muted)]">
                No visible campaign assets found.
              </p>
            ) : (
              campaign.assets.map((asset) => (
                <article
                  key={asset.id}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                        {asset.assetType}
                      </p>

                      <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                        {asset.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                        {asset.description ?? "No asset description has been added yet."}
                      </p>
                    </div>

                    <StatusBadge label="VISIBLE" tone="orange" />
                  </div>

                  {asset.resourceUrl !== null ? (
                    <a
                      href={asset.resourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex text-sm font-bold text-[var(--maurie-brown)]"
                    >
                      Open asset
                    </a>
                  ) : null}

                  <p className="mt-4 text-xs text-[var(--maurie-muted)]">
                    Added: {formatDate(asset.createdAt)}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>

        <aside className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Collaboration Room
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--maurie-muted)]">
            This room is prepared for private collaboration, campaign updates, asset sharing, event
            coordination, and future EOI or investment workflows.
          </p>

          <div className="mt-5 rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">Campaign Code</p>
            <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
              {campaign.campaignCode}
            </p>
          </div>

          <div className="mt-5 rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">Last Updated</p>
            <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
              {formatDateTime(campaign.updatedAt)}
            </p>
          </div>

          <div className="mt-5 rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">Room Protection</p>
            <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
              Collaborator-only secured access
            </p>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
