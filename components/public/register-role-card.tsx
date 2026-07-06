import Link from "next/link";
import type { RegisterPathwayContent } from "@/lib/public/register-content";

interface RegisterRoleCardProps extends RegisterPathwayContent {
  readonly isDisabled?: boolean;
}

/**
 * RegisterRoleCard renders one account-type pathway.
 *
 * The card uses global Mauri-E theme variables only, so it automatically adapts
 * to the base dark/light theme without page-specific theme state.
 */
export function RegisterRoleCard(props: RegisterRoleCardProps) {
  const isDisabled = props.isDisabled ?? false;

  const cardClassName =
    "group relative block overflow-hidden rounded-[1.5rem] border border-[var(--maurie-border)] bg-[var(--maurie-card)] p-5 shadow-[var(--maurie-shadow)] backdrop-blur-2xl transition duration-300 ease-out hover:-translate-y-1 hover:border-[var(--maurie-orange)] sm:rounded-[2rem] sm:p-6";

  const content = (
    <>
      {/* Decorative glow keeps the card premium while staying controlled by brand variables. */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[var(--maurie-orange)]/20 blur-3xl transition duration-300 group-hover:bg-[var(--maurie-yellow)]/20 sm:h-40 sm:w-40" />

      <div className="relative z-10 flex min-h-0 flex-col justify-between gap-6 sm:min-h-[21rem] sm:gap-8">
        <div className="grid gap-4 sm:gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-2">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--maurie-orange)] sm:text-xs sm:tracking-[0.22em]">
                {props.eyebrow}
              </p>

              <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)] sm:text-2xl">
                {props.title}
              </h2>
            </div>

            <span className="maurie-pill shrink-0 rounded-full px-3 py-1 text-xs font-semibold">
              {props.label}
            </span>
          </div>

          <p className="text-sm leading-6 text-[var(--maurie-muted)]">{props.description}</p>

          <div className="grid gap-2">
            {props.highlights.map((highlight) => (
              <div key={highlight} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--maurie-orange)]" />

                <p className="text-sm leading-6 text-[var(--maurie-muted)]">{highlight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-[var(--maurie-soft-border)] bg-[var(--maurie-surface)] p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
              After registration
            </p>

            <p className="mt-2 text-sm font-semibold text-[var(--maurie-text)]">{props.status}</p>
          </div>

          <div className="inline-flex items-center justify-between rounded-full border border-[var(--maurie-border)] bg-[var(--maurie-text)] px-4 py-3 text-sm font-semibold text-[var(--maurie-inverted-text)] transition group-hover:bg-[var(--maurie-brown)]">
            <span>Start now</span>
            <span aria-hidden="true">→</span>
          </div>
        </div>
      </div>
    </>
  );

  if (isDisabled) {
    return (
      <div className={`${cardClassName} cursor-not-allowed opacity-60`} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link href={props.href} className={cardClassName}>
      {content}
    </Link>
  );
}