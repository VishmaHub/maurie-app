import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { getCollaboratorCampaigns } from "@/lib/collaborator-campaigns";
import { formatDate } from "@/lib/formatters";

function getCampaignStatusTone(status: string): "yellow" | "orange" | "neutral" {
  if (status === "ACTIVE" || status === "COMPLETED") {
    return "yellow";
  }

  if (status === "REVIEW") {
    return "orange";
  }

  return "neutral";
}

export default async function CollaboratorCampaignsPage() {
  const session = await requireRole("COLLABORATOR");

  await writeAuditLog({
    actorId: session.userId,
    action: "COLLABORATOR_DATA_READ",
    resourceType: "CollaboratorCampaigns",
    resourceId: "collaborator-campaign-list"
  });

  const campaigns = await getCollaboratorCampaigns(session.userId);

  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "ACTIVE");
  const confidentialCampaigns = campaigns.filter((campaign) => campaign.isConfidential);

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Collaborator Campaign Rooms
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Campaign workspace.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            View private campaign rooms, collaboration details, shared campaign assets, timelines,
            and future-ready event or EOI structures.
          </p>
        </div>

        <Link href="/dashboard/collaborator" className="maurie-button-secondary">
          Back to Dashboard
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Total Campaigns</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {campaigns.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Active</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {activeCampaigns.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Confidential</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {confidentialCampaigns.length}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {campaigns.length === 0 ? (
          <div className="maurie-glass-soft rounded-3xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              No campaign rooms found.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Once a campaign room is assigned to your collaborator account, it will appear here.
            </p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/dashboard/collaborator/campaigns/${campaign.id}`}
              className="maurie-glass-soft group rounded-3xl p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(89,55,50,0.16)]"
            >
              <article>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                      {campaign.campaignCode}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--maurie-text)]">
                      {campaign.title}
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
                      {campaign.summary ?? "No campaign summary has been added yet."}
                    </p>
                  </div>

                  <StatusBadge
                    label={campaign.status}
                    tone={getCampaignStatusTone(campaign.status)}
                  />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Assets</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {campaign.assetCount}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Confidential</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {campaign.isConfidential ? "Yes" : "No"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Start</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDate(campaign.startsAt)}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">End</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDate(campaign.endsAt)}
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
