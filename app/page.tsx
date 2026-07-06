import Link from "next/link";
import { RegisterRoleCard } from "@/components/public/register-role-card";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getRegisterPageContent } from "@/lib/public/register-content";

/**
 * RegisterPage is the public entry point into the Mauri-E platform.
 *
 * It presents role-based registration pathways while relying on the global
 * theme system for dark/light styling.
 */
export default async function RegisterPage() {
  const content = await getRegisterPageContent();

  return (
    <main className="min-h-screen text-[var(--maurie-text)]">
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 sm:py-6">
        {/* Top navigation is intentionally minimal for registration conversion. */}
        <header className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--maurie-yellow)] text-sm font-black text-[var(--maurie-black)] shadow-[0_16px_40px_rgba(253,195,36,0.22)]">
              M
            </span>

            <span className="grid">
              <span className="text-sm font-semibold text-[var(--maurie-text)]">
                {content.brandTitle}
              </span>

              <span className="text-xs text-[var(--maurie-muted)]">{content.brandSubtitle}</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Link href={content.loginHref} className="maurie-button-secondary min-w-0 px-4 py-3">
              Login
            </Link>
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-center gap-8 py-8 sm:gap-10 sm:py-14">
          {/* Hero is intentionally shorter on mobile so the first card appears quickly. */}
          <div className="mx-auto grid max-w-4xl gap-4 text-center sm:gap-5">
            <div className="mx-auto inline-flex w-fit rounded-full border border-[var(--maurie-border)] bg-[var(--maurie-card)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--maurie-orange)] shadow-[0_10px_30px_rgba(89,55,50,0.08)]">
              {content.badge}
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--maurie-text)] sm:text-5xl lg:text-7xl">
              {content.heading}
            </h1>

            <p className="mx-auto max-w-2xl text-sm leading-7 text-[var(--maurie-muted)] sm:text-base lg:text-lg">
              {content.description}
            </p>
          </div>

          {/* Registration pathways are data-driven and can be moved to admin settings later. */}
          <div className="grid gap-4 lg:grid-cols-3">
            {content.pathways.map((pathway, index) => (
              <RegisterRoleCard
                key={pathway.title}
                index={index}
                title={pathway.title}
                eyebrow={pathway.eyebrow}
                description={pathway.description}
                href={pathway.href}
                label={pathway.label}
                status={pathway.status}
                highlights={pathway.highlights}
              />
            ))}
          </div>

          {/* Safety notes keep the MVP positioning clear without adding legal/payment complexity. */}
          <div className="grid gap-4 rounded-[1.5rem] border border-[var(--maurie-border)] bg-[var(--maurie-card)] p-4 shadow-[var(--maurie-shadow)] backdrop-blur-2xl sm:rounded-[1.75rem] sm:p-5 lg:grid-cols-3">
            {content.infoBlocks.map((infoBlock) => (
              <div key={infoBlock.title}>
                <p className="text-sm font-semibold text-[var(--maurie-text)]">{infoBlock.title}</p>

                <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                  {infoBlock.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
