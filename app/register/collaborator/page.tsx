import Link from "next/link";
import { CollaboratorRegistrationForm } from "@/components/public/collaborator-registration-form";

export default function CollaboratorRegistrationPage() {
  return (
    <main className="maurie-app-background min-h-screen px-6 py-10">
      <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="flex flex-col gap-5">
          <Link href="/register" className="text-sm font-semibold text-[var(--maurie-orange)]">
            ← Back to account types
          </Link>

          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Collaborator Registration
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-[var(--maurie-text)] md:text-5xl">
            Apply as a campaign collaborator.
          </h1>

          <p className="text-base leading-7 text-[var(--maurie-muted)]">
            Register your organisation, non-profit, or community group to express interest in future
            Mauri-E campaign partnerships.
          </p>

          <div className="maurie-glass-soft rounded-3xl p-5">
            <h2 className="text-lg font-semibold text-[var(--maurie-text)]">
              What happens after registration?
            </h2>

            <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--maurie-muted)]">
              <li>Your account is created as a collaborator account.</li>
              <li>Your partnership application is submitted for Mauri-E review.</li>
              <li>You are redirected to your collaborator dashboard.</li>
              <li>Campaign room access remains unavailable until admin approval.</li>
            </ul>
          </div>

          <div className="maurie-glass-soft rounded-3xl p-5">
            <h2 className="text-lg font-semibold text-[var(--maurie-text)]">
              Important safety note
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--maurie-muted)]">
              This is a non-binding partnership expression of interest only. It is not an investment
              offer, financial product, donation commitment, or guarantee of campaign participation.
            </p>
          </div>

          <p className="text-sm leading-6 text-[var(--maurie-muted)]">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-[var(--maurie-orange)]">
              Login here
            </Link>
            .
          </p>
        </div>

        <CollaboratorRegistrationForm />
      </section>
    </main>
  );
}
