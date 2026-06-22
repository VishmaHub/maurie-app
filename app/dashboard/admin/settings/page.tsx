import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminSettingsData } from "@/lib/admin-settings";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/formatters";

function getValueTone(valueType: string): "yellow" | "orange" | "neutral" {
  if (valueType === "SECRET") {
    return "orange";
  }

  if (valueType === "BOOLEAN" || valueType === "COLOUR") {
    return "yellow";
  }

  return "neutral";
}

export default async function AdminSettingsPage() {
  const session = await requireRole("ADMIN");

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminSettings",
    resourceId: "admin-settings-foundation"
  });

  const data = await getAdminSettingsData();

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Admin Settings
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Platform configuration.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            Review Mauri-E platform settings, feature flags, brand defaults, billing configuration,
            security indicators, and integration placeholders. Sensitive values are masked.
          </p>
        </div>

        <Link href="/dashboard/admin" className="maurie-button-secondary">
          Back to Admin
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Settings</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {data.totalSettings}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Categories</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {data.categories.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Sensitive</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {data.sensitiveSettings}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Mode</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">Read-only</p>
        </div>
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-6">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Settings foundation status
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
          This foundation creates database-backed configuration records. Future phases can add
          controlled editing, approval workflows, feature rollout rules, secret validation, and
          environment-specific settings.
        </p>
      </section>

      <section className="mt-8 grid gap-6">
        {data.categories.map((category) => (
          <div key={category.category} className="maurie-glass-soft rounded-3xl p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
                  {category.category}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                  {category.settings.length} setting
                  {category.settings.length === 1 ? "" : "s"} configured.
                </p>
              </div>

              <StatusBadge label={category.category.toUpperCase()} tone="neutral" />
            </div>

            <div className="mt-5 grid gap-3">
              {category.settings.map((setting) => (
                <article
                  key={setting.id}
                  className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                        {setting.key}
                      </p>

                      <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                        {setting.label}
                      </h3>

                      <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
                        {setting.description ?? "No setting description available."}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <StatusBadge
                        label={setting.valueType}
                        tone={getValueTone(setting.valueType)}
                      />

                      {setting.isSensitive ? (
                        <StatusBadge label="SENSITIVE" tone="orange" />
                      ) : (
                        <StatusBadge label="PUBLIC VALUE" tone="neutral" />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/30 p-4">
                      <p className="text-xs text-[var(--maurie-muted)]">Value</p>
                      <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                        {setting.value}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/30 p-4">
                      <p className="text-xs text-[var(--maurie-muted)]">Created</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                        {formatDateTime(setting.createdAt)}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/30 p-4">
                      <p className="text-xs text-[var(--maurie-muted)]">Updated</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                        {formatDateTime(setting.updatedAt)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
