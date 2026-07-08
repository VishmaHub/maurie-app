import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { updatePlatformSettingAction } from "@/lib/admin-settings-actions";
import { getAdminSettingsData, type AdminPlatformSetting } from "@/lib/admin-settings";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/formatters";

interface AdminSettingsPageProps {
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

function renderSettingInput(setting: AdminPlatformSetting) {
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
        defaultValue={setting.value}
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
        defaultValue={setting.value}
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
        defaultValue={setting.value}
        placeholder="#fdc324"
        className={baseClass}
        aria-label={`${setting.label} value`}
      />
    );
  }

  if (setting.valueType === "JSON") {
    return (
      <textarea
        name="value"
        defaultValue={setting.value}
        rows={16}
        className={`${baseClass} min-h-80 resize-y font-mono leading-6`}
        aria-label={`${setting.label} JSON value`}
        spellCheck={false}
      />
    );
  }

  return (
    <input
      name="value"
      type="text"
      defaultValue={setting.value}
      className={baseClass}
      aria-label={`${setting.label} value`}
    />
  );
}

function SettingEditForm(props: { readonly setting: AdminPlatformSetting }) {
  const isEditable = !props.setting.isSensitive;

  return (
    <form action={updatePlatformSettingAction} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
      <input type="hidden" name="settingId" value={props.setting.id} />
      <input type="hidden" name="returnPath" value="/dashboard/admin/settings" />
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

export default async function AdminSettingsPage(props: AdminSettingsPageProps) {
  const session = await requireRole("ADMIN");
  const searchParams = await props.searchParams;

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminSettings",
    resourceId: "admin-settings-editing"
  });

  const data = await getAdminSettingsData();
  const notice = getSettingsNotice(searchParams.status, searchParams.key);

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
            Review and update non-sensitive Mauri-E platform settings. Sensitive values remain
            masked and locked from browser-based editing.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/admin/settings/register-content" className="maurie-button-primary">
            Register Content Editor
          </Link>

          <Link href="/dashboard/admin" className="maurie-button-secondary">
            Back to Admin
          </Link>
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
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">Editable</p>
        </div>
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-6">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Editing rules
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
          Non-sensitive settings can be edited directly. Boolean values must be true or false,
          number values must be numeric, colour values must use a 6-digit hex code, JSON values must
          be valid JSON, and secret values are masked and locked from browser-based editing.
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
                      <Link
                        href={`/dashboard/admin/settings/${setting.id}`}
                        className="maurie-button-secondary"
                      >
                        View Detail
                      </Link>

                      <StatusBadge
                        label={setting.valueType}
                        tone={getValueTone(setting.valueType)}
                      />

                      {setting.isSensitive ? (
                        <StatusBadge label="LOCKED" tone="orange" />
                      ) : (
                        <StatusBadge label="EDITABLE" tone="yellow" />
                      )}
                    </div>
                  </div>

                  <SettingEditForm setting={setting} />

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
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
