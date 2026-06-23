import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { updatePlatformSettingAction } from "@/lib/admin-settings-actions";
import { getAdminSettingDetail, type AdminSettingDetail } from "@/lib/admin-setting-detail";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/formatters";

interface AdminSettingDetailPageProps {
  readonly params: Promise<{
    readonly settingId: string;
  }>;
  readonly searchParams: Promise<{
    readonly status?: string;
    readonly key?: string;
  }>;
}

interface SettingsNotice {
  readonly title: string;
  readonly description: string;
  readonly tone: "yellow" | "orange" | "neutral";
}

function getValueTone(valueType: string): "yellow" | "orange" | "neutral" {
  if (valueType === "SECRET") {
    return "orange";
  }

  if (valueType === "BOOLEAN" || valueType === "COLOUR") {
    return "yellow";
  }

  return "neutral";
}

function getSettingsNotice(
  status: string | undefined,
  key: string | undefined
): SettingsNotice | null {
  if (status === "updated") {
    return {
      title: "Setting updated.",
      description:
        typeof key === "string"
          ? `${key} was updated successfully.`
          : "The setting was updated successfully.",
      tone: "yellow"
    };
  }

  if (status === "invalid") {
    return {
      title: "Invalid setting value.",
      description: "The submitted value did not match the required setting type.",
      tone: "orange"
    };
  }

  if (status === "locked") {
    return {
      title: "Setting is locked.",
      description: "Sensitive settings cannot be edited from the admin interface.",
      tone: "orange"
    };
  }

  if (status === "not-found") {
    return {
      title: "Setting not found.",
      description: "The requested platform setting could not be found.",
      tone: "orange"
    };
  }

  return null;
}

function formatMetadata(metadata: unknown): string {
  return JSON.stringify(metadata, null, 2);
}

function renderSettingInput(setting: AdminSettingDetail) {
  const baseClass =
    "w-full rounded-2xl border border-[var(--maurie-border)] bg-white/70 px-4 py-3 text-sm text-[var(--maurie-text)] outline-none transition focus:border-[var(--maurie-orange)] disabled:cursor-not-allowed disabled:opacity-60";

  if (setting.isSensitive) {
    return (
      <input
        value={setting.value}
        disabled
        readOnly
        className={baseClass}
        aria-label={`${setting.label} value`}
      />
    );
  }

  if (setting.valueType === "BOOLEAN") {
    return (
      <select
        name="value"
        defaultValue={setting.rawValue}
        className={baseClass}
        aria-label={`${setting.label} value`}
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  }

  if (setting.valueType === "NUMBER") {
    return (
      <input
        name="value"
        type="number"
        defaultValue={setting.rawValue}
        className={baseClass}
        aria-label={`${setting.label} value`}
      />
    );
  }

  if (setting.valueType === "COLOUR") {
    return (
      <input
        name="value"
        type="text"
        defaultValue={setting.rawValue}
        placeholder="#fdc324"
        className={baseClass}
        aria-label={`${setting.label} value`}
      />
    );
  }

  return (
    <input
      name="value"
      type="text"
      defaultValue={setting.rawValue}
      className={baseClass}
      aria-label={`${setting.label} value`}
    />
  );
}

function SettingDetailEditForm(props: { readonly setting: AdminSettingDetail }) {
  const isEditable = !props.setting.isSensitive;

  return (
    <form action={updatePlatformSettingAction} className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
      <input type="hidden" name="settingId" value={props.setting.id} />
      <input
        type="hidden"
        name="returnPath"
        value={`/dashboard/admin/settings/${props.setting.id}`}
      />

      <label className="grid gap-2">
        <span className="text-xs font-semibold text-[var(--maurie-muted)]">Value</span>
        {renderSettingInput(props.setting)}
      </label>

      <button
        type="submit"
        disabled={!isEditable}
        className={
          isEditable
            ? "maurie-button-primary self-end"
            : "maurie-button-secondary cursor-not-allowed self-end opacity-60"
        }
      >
        {isEditable ? "Save" : "Locked"}
      </button>
    </form>
  );
}

export default async function AdminSettingDetailPage(props: AdminSettingDetailPageProps) {
  const session = await requireRole("ADMIN");
  const params = await props.params;
  const searchParams = await props.searchParams;

  const setting = await getAdminSettingDetail(params.settingId);

  if (setting === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "AdminSetting",
      resourceId: params.settingId,
      metadata: {
        reason: "setting-not-found"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminSetting",
    resourceId: setting.id
  });

  const notice = getSettingsNotice(searchParams.status, searchParams.key);

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            {setting.category}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            {setting.label}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            {setting.description ?? "No setting description available."}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/admin/settings" className="maurie-button-secondary">
            Back to Settings
          </Link>

          <StatusBadge label={setting.valueType} tone={getValueTone(setting.valueType)} />
        </div>
      </div>

      {notice === null ? null : (
        <section className="maurie-glass-soft mt-8 rounded-3xl p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
                {notice.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                {notice.description}
              </p>
            </div>

            <StatusBadge label={searchParams.status ?? "STATUS"} tone={notice.tone} />
          </div>
        </section>
      )}

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Category</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">{setting.category}</p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Type</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {setting.valueType}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Access</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {setting.isSensitive ? "Locked" : "Editable"}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Audit Events</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {setting.auditTrail.length}
          </p>
        </div>
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              Setting value
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Sensitive settings remain masked. Non-sensitive settings can be edited by admins.
            </p>
          </div>

          {setting.isSensitive ? (
            <StatusBadge label="LOCKED" tone="orange" />
          ) : (
            <StatusBadge label="EDITABLE" tone="yellow" />
          )}
        </div>

        <SettingDetailEditForm setting={setting} />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Setting Metadata
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Key</p>
              <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                {setting.key}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Setting ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {setting.id}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Current Display Value</p>
              <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                {setting.value}
              </p>
            </div>
          </div>
        </div>

        <aside className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Timeline
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Created</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {formatDateTime(setting.createdAt)}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Updated</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {formatDateTime(setting.updatedAt)}
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-6">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Setting Audit Trail
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
          This shows audit events linked to this setting. Update events are recorded when admins
          save setting changes.
        </p>

        <div className="mt-5 grid gap-3">
          {setting.auditTrail.length === 0 ? (
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-sm font-semibold text-[var(--maurie-text)]">
                No setting-specific audit events yet.
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                Audit records will appear here after this setting is updated.
              </p>
            </div>
          ) : (
            setting.auditTrail.map((auditLog) => (
              <article
                key={auditLog.id}
                className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
                      {formatDateTime(auditLog.timestamp)}
                    </p>

                    <h3 className="mt-2 text-base font-semibold text-[var(--maurie-text)]">
                      {auditLog.action}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">
                      Actor: {auditLog.actorName ?? "System"}{" "}
                      {auditLog.actorEmail === null ? "" : `· ${auditLog.actorEmail}`}
                    </p>
                  </div>

                  <StatusBadge label={auditLog.action} tone="yellow" />
                </div>

                <pre className="mt-4 overflow-x-auto rounded-3xl border border-[var(--maurie-border)] bg-white/40 p-4 text-xs leading-5 text-[var(--maurie-brown)]">
                  {formatMetadata(auditLog.metadata)}
                </pre>
              </article>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}
