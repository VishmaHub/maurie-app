import Link from "next/link";
import { RegisterRoleCard } from "@/components/public/register-role-card";

export default function RegisterPage() {
  return (
    <main className="maurie-app-background min-h-screen px-6 py-10">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-5 lg:max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Join Mauri-E
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-[var(--maurie-text)] md:text-6xl">
            Create your account.
          </h1>

          <p className="text-base leading-7 text-[var(--maurie-muted)]">
            Mauri-E is becoming a public self-service platform for creators, businesses, and
            collaborators. Start with the account type that matches your role.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <RegisterRoleCard
            title="Creator"
            description="Build your public creative profile, prepare your vCard, showcase your work, and receive booking opportunities."
            href="/register/creator"
            label="Available"
          />

          <RegisterRoleCard
            title="Business"
            description="Create a business account, prepare your public listing, and request Mauri-E services from your client dashboard."
            href="/register/business"
            label="Available"
          />

          <RegisterRoleCard
            title="Collaborator"
            description="Register as a non-profit, community group, or partner organisation to submit a non-binding campaign partnership interest."
            href="/register/collaborator"
            label="Available"
          />
        </div>

        <div className="maurie-glass-soft rounded-3xl p-6">
          <p className="text-sm leading-6 text-[var(--maurie-muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--maurie-orange)]">
              Login here
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
