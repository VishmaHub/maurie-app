import Link from "next/link";
import { CreatorRegistrationForm } from "@/components/public/creator-registration-form";

export default function CreatorRegistrationPage() {
  return (
    <main className="maurie-app-background min-h-screen px-6 py-10">
      <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="flex flex-col gap-5">
          <Link href="/register" className="text-sm font-semibold text-[var(--maurie-orange)]">
            ← Back to account types
          </Link>

          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Creator Registration
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-[var(--maurie-text)] md:text-5xl">
            Start your creator profile.
          </h1>

          <p className="text-base leading-7 text-[var(--maurie-muted)]">
            Create a Mauri-E creator account to prepare your public profile, portfolio, vCard, and
            booking presence.
          </p>

          <div className="maurie-glass-soft rounded-3xl p-5">
            <h2 className="text-lg font-semibold text-[var(--maurie-text)]">
              What happens after registration?
            </h2>

            <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--maurie-muted)]">
              <li>Your account is created as a creator account.</li>
              <li>Your public profile starts as a private draft.</li>
              <li>You are redirected to your creative dashboard.</li>
              <li>You can complete your profile before publishing later.</li>
            </ul>
          </div>

          <p className="text-sm leading-6 text-[var(--maurie-muted)]">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-[var(--maurie-orange)]">
              Login here
            </Link>
            .
          </p>
        </div>

        <CreatorRegistrationForm />
      </section>
    </main>
  );
}
