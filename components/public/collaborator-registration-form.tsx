"use client";

import { useActionState } from "react";
import {
  registerCollaboratorAction,
  type CollaboratorRegistrationActionState
} from "@/lib/public-registration-actions";

const initialCollaboratorRegistrationState: CollaboratorRegistrationActionState = {
  status: "idle",
  message: "",
  fieldErrors: {
    organisationName: [],
    contactName: [],
    email: [],
    password: [],
    confirmPassword: [],
    organisationType: [],
    partnershipInterestSummary: [],
    consentAccepted: [],
    nonBindingAcknowledged: []
  }
};

interface FieldErrorProps {
  readonly errors: readonly string[];
}

interface TextFieldProps {
  readonly label: string;
  readonly name: string;
  readonly type: "text" | "email" | "password";
  readonly placeholder: string;
  readonly errors: readonly string[];
  readonly autoComplete?: string;
  readonly required?: boolean;
}

function FieldError(props: FieldErrorProps) {
  const firstError = props.errors[0];

  if (typeof firstError !== "string") {
    return null;
  }

  return <p className="text-xs font-medium text-[var(--maurie-orange)]">{firstError}</p>;
}

function TextField(props: TextFieldProps) {
  const autoComplete = props.autoComplete;
  const isRequired = props.required ?? false;

  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[var(--maurie-text)]">{props.label}</span>

      <input
        name={props.name}
        type={props.type}
        placeholder={props.placeholder}
        required={isRequired}
        className="w-full rounded-2xl border border-[var(--maurie-border)] bg-white/75 px-4 py-3 text-sm text-[var(--maurie-text)] outline-none transition focus:border-[var(--maurie-orange)]"
        {...(typeof autoComplete === "string" ? { autoComplete } : {})}
      />

      <FieldError errors={props.errors} />
    </label>
  );
}

export function CollaboratorRegistrationForm() {
  const [state, formAction, isPending] = useActionState(
    registerCollaboratorAction,
    initialCollaboratorRegistrationState
  );

  return (
    <form action={formAction} className="maurie-glass-soft grid gap-5 rounded-3xl p-6">
      {state.status === "error" ? (
        <div className="rounded-3xl border border-[var(--maurie-orange)] bg-white/60 p-4">
          <p className="text-sm font-semibold text-[var(--maurie-text)]">
            Registration could not be completed.
          </p>

          <p className="mt-1 text-sm leading-6 text-[var(--maurie-muted)]">{state.message}</p>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          label="Organisation name"
          name="organisationName"
          type="text"
          placeholder="Organisation or non-profit name"
          autoComplete="organization"
          required
          errors={state.fieldErrors.organisationName}
        />

        <TextField
          label="Contact name"
          name="contactName"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          required
          errors={state.fieldErrors.contactName}
        />

        <TextField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.org"
          autoComplete="email"
          required
          errors={state.fieldErrors.email}
        />

        <TextField
          label="Organisation type"
          name="organisationType"
          type="text"
          placeholder="Non-profit, community group, partner organisation"
          autoComplete="organization-title"
          required
          errors={state.fieldErrors.organisationType}
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          placeholder="Minimum 12 characters"
          autoComplete="new-password"
          required
          errors={state.fieldErrors.password}
        />

        <TextField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          required
          errors={state.fieldErrors.confirmPassword}
        />
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-[var(--maurie-text)]">
          Partnership interest summary
        </span>

        <textarea
          name="partnershipInterestSummary"
          placeholder="Tell us how your organisation may want to collaborate with Mauri-E campaigns."
          required
          rows={6}
          className="w-full rounded-2xl border border-[var(--maurie-border)] bg-white/75 px-4 py-3 text-sm text-[var(--maurie-text)] outline-none transition focus:border-[var(--maurie-orange)]"
        />

        <FieldError errors={state.fieldErrors.partnershipInterestSummary} />
      </label>

      <div className="grid gap-4 rounded-3xl border border-[var(--maurie-border)] bg-white/40 p-4">
        <label className="flex gap-3">
          <input
            name="consentAccepted"
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-[var(--maurie-border)]"
          />

          <span className="text-sm leading-6 text-[var(--maurie-muted)]">
            I understand that this account will create a collaborator profile and a partnership
            application for Mauri-E review.
          </span>
        </label>

        <FieldError errors={state.fieldErrors.consentAccepted} />

        <label className="flex gap-3">
          <input
            name="nonBindingAcknowledged"
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-[var(--maurie-border)]"
          />

          <span className="text-sm leading-6 text-[var(--maurie-muted)]">
            I acknowledge this is a non-binding partnership expression of interest. It is not an
            investment offer, financial product, donation commitment, or guarantee of campaign
            participation.
          </span>
        </label>

        <FieldError errors={state.fieldErrors.nonBindingAcknowledged} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={
          isPending
            ? "maurie-button-secondary cursor-not-allowed opacity-70"
            : "maurie-button-primary"
        }
      >
        {isPending ? "Submitting application..." : "Create Collaborator Account"}
      </button>
    </form>
  );
}