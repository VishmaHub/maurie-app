"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { FormNotice } from "@/components/ui/form-notice";
import { createInitialActionResponse } from "@/lib/actions/action-response";
import type { AdminListingClientOption } from "@/lib/admin-listings";
import type { ActionResponse } from "@/types/action-response";

export interface BusinessListingFormValues {
  readonly clientId: string;
  readonly businessName: string;
  readonly publicSlug: string;
  readonly headline: string;
  readonly description: string | null;
  readonly websiteUrl: string | null;
  readonly contactEmail: string | null;
  readonly contactPhoneE164: string | null;
  readonly seoTitle: string | null;
  readonly seoDescription: string | null;
  readonly isPublished: boolean;
}

interface BusinessListingFormProps {
  readonly action: (previousState: ActionResponse, formData: FormData) => Promise<ActionResponse>;
  readonly mode: "create" | "edit";
  readonly listingId?: string;
  readonly clients: readonly AdminListingClientOption[];
  readonly initialValues: BusinessListingFormValues;
  readonly cancelHref: string;
}

const INPUT_CLASS_NAME =
  "w-full rounded-2xl border border-[var(--maurie-border)] bg-white/70 px-4 py-3 text-sm text-[var(--maurie-text)] outline-none transition focus:border-[var(--maurie-orange)] disabled:cursor-not-allowed disabled:opacity-60";

function FieldError(props: { readonly state: ActionResponse; readonly name: string }) {
  const messages = props.state.fieldErrors[props.name] ?? [];

  if (messages.length === 0) {
    return null;
  }

  return (
    <div id={`${props.name}-error`} className="grid gap-1" aria-live="polite">
      {messages.map((message, index) => (
        <p key={`${message}-${index}`} className="text-xs font-medium text-[var(--maurie-orange)]">
          {message}
        </p>
      ))}
    </div>
  );
}

function hasFieldError(state: ActionResponse, name: string): boolean {
  return (state.fieldErrors[name]?.length ?? 0) > 0;
}

function SubmitButton(props: { readonly mode: "create" | "edit" }) {
  const status = useFormStatus();
  const idleLabel = props.mode === "create" ? "Create Listing" : "Save Changes";
  const pendingLabel = props.mode === "create" ? "Creating…" : "Saving…";

  return (
    <button
      type="submit"
      disabled={status.pending}
      className="maurie-button-primary disabled:cursor-wait disabled:opacity-60"
    >
      {status.pending ? pendingLabel : idleLabel}
    </button>
  );
}

export function BusinessListingForm(props: BusinessListingFormProps) {
  const [state, formAction] = useActionState(props.action, createInitialActionResponse());

  return (
    <form action={formAction} className="grid gap-6">
      {typeof props.listingId === "string" ? (
        <input type="hidden" name="listingId" value={props.listingId} />
      ) : null}

      {state.status === "error" ? (
        <FormNotice title="The listing could not be saved." message={state.message} tone="error" />
      ) : null}

      <section className="maurie-glass-soft rounded-3xl p-6">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Ownership and publishing
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
          Assign the listing to a client account and control whether it is visible publicly.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--maurie-text)]">Client owner</span>
            <select
              name="clientId"
              defaultValue={props.initialValues.clientId}
              required
              aria-invalid={hasFieldError(state, "clientId")}
              aria-describedby={hasFieldError(state, "clientId") ? "clientId-error" : undefined}
              className={INPUT_CLASS_NAME}
            >
              <option value="" disabled>
                Select a client
              </option>
              {props.clients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                  disabled={!client.isActive && client.id !== props.initialValues.clientId}
                >
                  {client.displayName} · {client.email}
                  {client.isActive ? "" : " (inactive)"}
                </option>
              ))}
            </select>
            <FieldError state={state} name="clientId" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--maurie-text)]">
              Publication status
            </span>
            <select
              name="isPublished"
              defaultValue={String(props.initialValues.isPublished)}
              required
              aria-invalid={hasFieldError(state, "isPublished")}
              aria-describedby={
                hasFieldError(state, "isPublished") ? "isPublished-error" : undefined
              }
              className={INPUT_CLASS_NAME}
            >
              <option value="false">Draft</option>
              <option value="true">Published</option>
            </select>
            <FieldError state={state} name="isPublished" />
          </label>
        </div>
      </section>

      <section className="maurie-glass-soft rounded-3xl p-6">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Listing content
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--maurie-text)]">Business name</span>
            <input
              name="businessName"
              type="text"
              defaultValue={props.initialValues.businessName}
              required
              maxLength={180}
              aria-invalid={hasFieldError(state, "businessName")}
              aria-describedby={
                hasFieldError(state, "businessName") ? "businessName-error" : undefined
              }
              className={INPUT_CLASS_NAME}
            />
            <FieldError state={state} name="businessName" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--maurie-text)]">Public slug</span>
            <div className="flex items-center rounded-2xl border border-[var(--maurie-border)] bg-white/70 focus-within:border-[var(--maurie-orange)]">
              <span className="pl-4 text-sm text-[var(--maurie-muted)]">/l/</span>
              <input
                name="publicSlug"
                type="text"
                defaultValue={props.initialValues.publicSlug}
                required
                maxLength={140}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                aria-invalid={hasFieldError(state, "publicSlug")}
                aria-describedby="publicSlug-help publicSlug-error"
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-[var(--maurie-text)] outline-none"
              />
            </div>
            <p id="publicSlug-help" className="text-xs text-[var(--maurie-muted)]">
              Lowercase letters, numbers, and hyphens only.
            </p>
            <FieldError state={state} name="publicSlug" />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-semibold text-[var(--maurie-text)]">Headline</span>
            <input
              name="headline"
              type="text"
              defaultValue={props.initialValues.headline}
              required
              maxLength={220}
              aria-invalid={hasFieldError(state, "headline")}
              aria-describedby={hasFieldError(state, "headline") ? "headline-error" : undefined}
              className={INPUT_CLASS_NAME}
            />
            <FieldError state={state} name="headline" />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-semibold text-[var(--maurie-text)]">Description</span>
            <textarea
              name="description"
              defaultValue={props.initialValues.description ?? ""}
              rows={7}
              maxLength={1600}
              aria-invalid={hasFieldError(state, "description")}
              aria-describedby={
                hasFieldError(state, "description") ? "description-error" : undefined
              }
              className={INPUT_CLASS_NAME}
            />
            <FieldError state={state} name="description" />
          </label>
        </div>
      </section>

      <section className="maurie-glass-soft rounded-3xl p-6">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Contact details
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--maurie-text)]">Website URL</span>
            <input
              name="websiteUrl"
              type="url"
              defaultValue={props.initialValues.websiteUrl ?? ""}
              maxLength={2048}
              placeholder="https://example.com"
              aria-invalid={hasFieldError(state, "websiteUrl")}
              aria-describedby={hasFieldError(state, "websiteUrl") ? "websiteUrl-error" : undefined}
              className={INPUT_CLASS_NAME}
            />
            <FieldError state={state} name="websiteUrl" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--maurie-text)]">Contact email</span>
            <input
              name="contactEmail"
              type="email"
              defaultValue={props.initialValues.contactEmail ?? ""}
              maxLength={320}
              aria-invalid={hasFieldError(state, "contactEmail")}
              aria-describedby={
                hasFieldError(state, "contactEmail") ? "contactEmail-error" : undefined
              }
              className={INPUT_CLASS_NAME}
            />
            <FieldError state={state} name="contactEmail" />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-semibold text-[var(--maurie-text)]">Contact phone</span>
            <input
              name="contactPhoneE164"
              type="tel"
              defaultValue={props.initialValues.contactPhoneE164 ?? ""}
              maxLength={32}
              placeholder="+61412345678"
              aria-invalid={hasFieldError(state, "contactPhoneE164")}
              aria-describedby={
                hasFieldError(state, "contactPhoneE164") ? "contactPhoneE164-error" : undefined
              }
              className={INPUT_CLASS_NAME}
            />
            <FieldError state={state} name="contactPhoneE164" />
          </label>
        </div>
      </section>

      <section className="maurie-glass-soft rounded-3xl p-6">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Search metadata
        </h2>

        <div className="mt-5 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--maurie-text)]">SEO title</span>
            <input
              name="seoTitle"
              type="text"
              defaultValue={props.initialValues.seoTitle ?? ""}
              maxLength={180}
              aria-invalid={hasFieldError(state, "seoTitle")}
              aria-describedby={hasFieldError(state, "seoTitle") ? "seoTitle-error" : undefined}
              className={INPUT_CLASS_NAME}
            />
            <FieldError state={state} name="seoTitle" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--maurie-text)]">SEO description</span>
            <textarea
              name="seoDescription"
              defaultValue={props.initialValues.seoDescription ?? ""}
              rows={4}
              maxLength={300}
              aria-invalid={hasFieldError(state, "seoDescription")}
              aria-describedby={
                hasFieldError(state, "seoDescription") ? "seoDescription-error" : undefined
              }
              className={INPUT_CLASS_NAME}
            />
            <FieldError state={state} name="seoDescription" />
          </label>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link href={props.cancelHref} className="maurie-button-secondary">
          Cancel
        </Link>
        <SubmitButton mode={props.mode} />
      </div>
    </form>
  );
}
