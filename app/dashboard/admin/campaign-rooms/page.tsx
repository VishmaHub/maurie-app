import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminCampaignRooms } from "@/lib/admin-campaign-rooms";
import { requireRole } from "@/lib/auth/require-role";
import { formatDate } from "@/lib/formatters";

function getCampaignStatusTone(status: string): "yellow" | "orange" | "neutral" {
  if (status === "ACTIVE" || status === "COMPLETED") {
    return "yellow";
  }

  if (status === "DRAFT" || status === "REVIEW") {
    return "orange";
  }

  return "neutral";
}

export default async function AdminCampaignRoomsPage() {
  const session = await requireRole("ADMIN");

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminCampaignRooms",
    resourceId: "admin-campaign-room-records"
  });

  const campaignRooms = await getAdminCampaignRooms();

  const activeCampaignRooms = campaignRooms.filter(
    (campaignRoom): boolean => campaignRoom.status === "ACTIVE"
  );

  const confidentialCampaignRooms = campaignRooms.filter(
    (campaignRoom): boolean => campaignRoom.isConfidential
  );

  const totalAssets = campaignRooms.reduce(
    (total, campaignRoom): number => total + campaignRoom.assetCount,
    0
  );

  const visibleAssets = campaignRooms.reduce(
    (total, campaignRoom): number => total + campaignRoom.visibleAssetCount,
    0
  );

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Admin Campaign Room Records
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Campaign rooms.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            View collaborator campaign rooms, campaign status, confidentiality controls, timeline,
            assets, and ownership metadata from an admin-only Mauri-E workspace.
          </p>
        </div>

        <Link href="/dashboard/admin" className="maurie-button-secondary">
          Back to Admin
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Campaign Rooms</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {campaignRooms.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Active</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {activeCampaignRooms.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Confidential</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {confidentialCampaignRooms.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Assets</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">{totalAssets}</p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Visible Assets</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">{visibleAssets}</p>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {campaignRooms.length === 0 ? (
          <div className="maurie-glass-soft rounded-3xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              No campaign rooms found.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Campaign room records will appear here once collaborator campaigns are created.
            </p>
          </div>
        ) : (
          campaignRooms.map((campaignRoom) => (
            <Link
              key={campaignRoom.id}
              href={`/dashboard/admin/campaign-rooms/${campaignRoom.id}`}
              className="maurie-glass-soft group rounded-3xl p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(89,55,50,0.16)]"
            >
              <article>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                      {campaignRoom.campaignCode}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--maurie-text)]">
                      {campaignRoom.title}
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
                      {campaignRoom.summary ?? "No campaign summary available."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <StatusBadge
                      label={campaignRoom.status}
                      tone={getCampaignStatusTone(campaignRoom.status)}
                    />

                    <StatusBadge
                      label={campaignRoom.isConfidential ? "CONFIDENTIAL" : "OPEN"}
                      tone={campaignRoom.isConfidential ? "orange" : "neutral"}
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-5">
                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Collaborator</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {campaignRoom.collaboratorName}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Assets</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {campaignRoom.assetCount}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Visible</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {campaignRoom.visibleAssetCount}
                    </p>
                  </div>

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
              </article>
            </Link>
          ))
        )}
      </section>
    </AppShell>
  );
}
