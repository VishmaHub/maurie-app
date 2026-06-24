"use client";

import { useActionState } from "react";
import {
  registerBusinessAction,
  type BusinessRegistrationActionState
} from "@/lib/public-registration-actions";

const initialBusinessRegistrationState: BusinessRegistrationActionState = {
  status: "idle",
  message: "",
  fieldErrors: {
    contactName: [],
    businessName: [],
    email: [],
    password: [],
    confirmPassword: [],
    businessSlug: [],
    websiteUrl: [],
    phone: [],
    consentAccepted: []
  }
};

interface FieldErrorProps {
  readonly errors: readonly string[];
}

interface TextFieldProps {
  readonly label: string;
  readonly name: string;
  readonly type: "text" | "email" | "password" | "url" | "tel";
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

export function BusinessRegistrationForm() {
  const [state, formAction, isPending] = useActionState(
    registerBusinessAction,
    initialBusinessRegistrationState
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
          label="Contact name"
          name="contactName"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          required
          errors={state.fieldErrors.contactName}
        />

        <TextField
          label="Business name"
          name="businessName"
          type="text"
          placeholder="Your business name"
          autoComplete="organization"
          required
          errors={state.fieldErrors.businessName}
        />

        <TextField
          label="Email"
          name="email"
          type="email"
          placeholder="business@example.com"
          autoComplete="email"
          required
          errors={state.fieldErrors.email}
        />

        <TextField
          label="Business listing slug"
          name="businessSlug"
          type="text"
          placeholder="e.g. juju-cafe"
          autoComplete="off"
          required
          errors={state.fieldErrors.businessSlug}
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

        <TextField
          label="Website"
          name="websiteUrl"
          type="url"
          placeholder="https://example.com"
          autoComplete="url"
          errors={state.fieldErrors.websiteUrl}
        />

        <TextField
          label="Phone"
          name="phone"
          type="tel"
          placeholder="+61412345678"
          autoComplete="tel"
          errors={state.fieldErrors.phone}
        />
      </div>

      <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/40 p-4">
        <label className="flex gap-3">
          <input
            name="consentAccepted"
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-[var(--maurie-border)]"
          />

          <span className="text-sm leading-6 text-[var(--maurie-muted)]">
            I understand that this account will create a draft business listing on Mauri-E. I agree
            to be contacted about my account, listing, and future platform updates.
          </span>
        </label>

        <div className="mt-2">
          <FieldError errors={state.fieldErrors.consentAccepted} />
        </div>
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
        {isPending ? "Creating business account..." : "Create Business Account"}
      </button>
    </form>
  );
}