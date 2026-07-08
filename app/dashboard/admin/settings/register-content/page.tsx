import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { updateRegisterContentAction } from "@/lib/admin-register-content-actions";
import { getAdminRegisterContentEditorData } from "@/lib/admin-register-content";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/formatters";
import type {
  RegisterInfoBlockContent,
  RegisterPathwayContent
} from "@/lib/public/register-content";

export const dynamic = "force-dynamic";

interface RegisterContentEditorPageProps {
  readonly searchParams: Promise<{
    readonly status?: string;
  }>;
}

interface TextInputProps {
  readonly label: string;
  readonly name: string;
  readonly defaultValue: string;
  readonly helper?: string;
}

interface TextareaInputProps {
  readonly label: string;
  readonly name: string;
  readonly defaultValue: string;
  readonly rows?: number;
  readonly helper?: string;
}

function getNotice(status: string | undefined) {
  if (status === "updated") {
    return {
      title: "Register content updated.",
      description: "The public register page content was saved successfully.",
      tone: "yellow" as const
    };
  }

  if (status === "invalid") {
    return {
      title: "Content could not be saved.",
      description:
        "Please check that every required field has content and each card has at least one highlight.",
      tone: "orange" as const
    };
  }

  return null;
}

function TextInput(props: TextInputProps) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold text-[var(--maurie-muted)]">{props.label}</span>

      <input
        name={props.name}
        type="text"
        defaultValue={props.defaultValue}
        className="w-full rounded-2xl border border-[var(--maurie-border)] bg-[var(--maurie-card)] px-4 py-3 text-sm text-[var(--maurie-text)] outline-none transition focus:border-[var(--maurie-orange)]"
      />

      {typeof props.helper === "string" ? (
        <span className="text-xs leading-5 text-[var(--maurie-muted)]">{props.helper}</span>
      ) : null}
    </label>
  );
}

function TextareaInput(props: TextareaInputProps) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold text-[var(--maurie-muted)]">{props.label}</span>

      <textarea
        name={props.name}
        defaultValue={props.defaultValue}
        rows={props.rows ?? 4}
        className="w-full resize-y rounded-2xl border border-[var(--maurie-border)] bg-[var(--maurie-card)] px-4 py-3 text-sm leading-6 text-[var(--maurie-text)] outline-none transition focus:border-[var(--maurie-orange)]"
      />

      {typeof props.helper === "string" ? (
        <span className="text-xs leading-5 text-[var(--maurie-muted)]">{props.helper}</span>
      ) : null}
    </label>
  );
}

function PathwayEditor(props: {
  readonly pathway: RegisterPathwayContent;
  readonly index: number;
}) {
  const prefix = `pathway-${props.index}`;

  return (
    <section className="rounded-3xl border border-[var(--maurie-border)] bg-[var(--maurie-card)] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--maurie-orange)]">
            Pathway {props.index + 1}
          </p>

          <h3 className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {props.pathway.title}
          </h3>
        </div>

        <StatusBadge label={props.pathway.label} tone="neutral" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Title" name={`${prefix}-title`} defaultValue={props.pathway.title} />

        <TextInput label="Label" name={`${prefix}-label`} defaultValue={props.pathway.label} />

        <TextInput
          label="Eyebrow"
          name={`${prefix}-eyebrow`}
          defaultValue={props.pathway.eyebrow}
        />

        <TextInput label="Link" name={`${prefix}-href`} defaultValue={props.pathway.href} />

        <TextareaInput
          label="Description"
          name={`${prefix}-description`}
          defaultValue={props.pathway.description}
          rows={4}
        />

        <TextareaInput
          label="After registration status"
          name={`${prefix}-status`}
          defaultValue={props.pathway.status}
          rows={4}
        />

        <div className="md:col-span-2">
          <TextareaInput
            label="Highlights"
            name={`${prefix}-highlights`}
            defaultValue={props.pathway.highlights.join("\n")}
            rows={5}
            helper="Enter one highlight per line."
          />
        </div>
      </div>
    </section>
  );
}

function InfoBlockEditor(props: {
  readonly infoBlock: RegisterInfoBlockContent;
  readonly index: number;
}) {
  const prefix = `info-${props.index}`;

  return (
    <section className="rounded-3xl border border-[var(--maurie-border)] bg-[var(--maurie-card)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--maurie-orange)]">
        Info Block {props.index + 1}
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <TextInput label="Title" name={`${prefix}-title`} defaultValue={props.infoBlock.title} />

        <TextareaInput
          label="Description"
          name={`${prefix}-description`}
          defaultValue={props.infoBlock.description}
          rows={4}
        />
      </div>
    </section>
  );
}

export default async function RegisterContentEditorPage(props: RegisterContentEditorPageProps) {
  const session = await requireRole("ADMIN");
  const searchParams = await props.searchParams;
  const data = await getAdminRegisterContentEditorData();
  const notice = getNotice(searchParams.status);

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "PlatformSetting",
    resourceId: "public-register-content-editor"
  });

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Public Content
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Register page editor.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            Edit the public /register page without touching raw JSON. Changes are validated before
            they are saved.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/register" className="maurie-button-secondary">
            View Register Page
          </Link>

          <Link href="/dashboard/admin/settings" className="maurie-button-secondary">
            Back to Settings
          </Link>
        </div>
      </div>

      {notice === null ? null : (
        <section className="maurie-glass-soft mt-8 rounded-3xl p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[var(--maurie-text)]">{notice.title}</h2>

              <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                {notice.description}
              </p>
            </div>

            <StatusBadge label={searchParams.status ?? "STATUS"} tone={notice.tone} />
          </div>
        </section>
      )}

      {data.isUsingFallback ? (
        <section className="maurie-glass-soft mt-8 rounded-3xl p-5">
          <h2 className="text-xl font-semibold text-[var(--maurie-text)]">
            Using fallback content.
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
            The current database setting is missing or invalid. Saving this form will create or
            repair the admin-controlled register content setting.
          </p>
        </section>
      ) : null}

      <form action={updateRegisterContentAction} className="mt-8 grid gap-6">
        <input type="hidden" name="pathwayCount" value={data.content.pathways.length} />
        <input type="hidden" name="infoBlockCount" value={data.content.infoBlocks.length} />

        <section className="rounded-3xl border border-[var(--maurie-border)] bg-[var(--maurie-card)] p-5">
          <h2 className="text-xl font-semibold text-[var(--maurie-text)]">Hero content</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextInput
              label="Brand title"
              name="brandTitle"
              defaultValue={data.content.brandTitle}
            />

            <TextInput
              label="Brand subtitle"
              name="brandSubtitle"
              defaultValue={data.content.brandSubtitle}
            />

            <TextInput label="Badge" name="badge" defaultValue={data.content.badge} />

            <TextInput label="Login link" name="loginHref" defaultValue={data.content.loginHref} />

            <div className="md:col-span-2">
              <TextInput label="Heading" name="heading" defaultValue={data.content.heading} />
            </div>

            <div className="md:col-span-2">
              <TextareaInput
                label="Description"
                name="description"
                defaultValue={data.content.description}
                rows={4}
              />
            </div>
          </div>
        </section>

        {data.content.pathways.map((pathway, index) => (
          <PathwayEditor key={pathway.title} pathway={pathway} index={index} />
        ))}

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold text-[var(--maurie-text)]">Bottom info blocks</h2>

          {data.content.infoBlocks.map((infoBlock, index) => (
            <InfoBlockEditor key={infoBlock.title} infoBlock={infoBlock} index={index} />
          ))}
        </section>

        <section className="maurie-glass-soft rounded-3xl p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[var(--maurie-text)]">Save changes</h2>

              <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                Last updated:{" "}
                {data.updatedAt === null ? "Not saved yet" : formatDateTime(data.updatedAt)}
              </p>
            </div>

            <button type="submit" className="maurie-button-primary">
              Save Register Content
            </button>
          </div>
        </section>
      </form>
    </AppShell>
  );
}
