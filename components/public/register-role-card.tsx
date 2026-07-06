import Link from "next/link";
import type { RegisterPathwayContent } from "@/lib/public/register-content";

interface RegisterRoleCardProps extends RegisterPathwayContent {
  readonly index?: number;
  readonly isDisabled?: boolean;
}

/**
 * RegisterRoleCard renders one public registration pathway.
 *
 * It uses only global Mauri-E theme variables, so it automatically responds to
 * the base app dark/light theme without local theme state.
 */
export function RegisterRoleCard(props: RegisterRoleCardProps) {
  const isDisabled = props.isDisabled ?? false;

  const cardClassName =
    "group relative block overflow-hidden rounded-[1.5rem] border border-[var(--maurie-border)] bg-[var(--maurie-card)] p-4 shadow-[var(--maurie-shadow)] backdrop-blur-2xl transition duration-300 ease-out hover:-translate-y-1 hover:border-[var(--maurie-orange)] sm:rounded-[1.75rem] sm:p-5 lg:p-6";

  const content = (
    <>
      {/* Soft brand glow gives the card depth without hardcoding a dark or light theme. */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[var(--maurie-orange)]/20 blur-3xl transition duration-300 group-hover:bg-[var(--maurie-yellow)]/24" />

      <div className="relative z-10 grid gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--maurie-border)] bg-[var(--maurie-surface)] text-xs font-black text-[var(--maurie-text)]">
                {typeof props.index === "number" ? props.index + 1 : "•"}
              </span>

              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--maurie-orange)]">
                {props.eyebrow}
              </p>
            </div>

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

        <div className="rounded-2xl border border-[var(--maurie-soft-border)] bg-[var(--maurie-surface)] p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
            After registration
          </p>

          <p className="mt-2 text-sm font-semibold text-[var(--maurie-text)]">{props.status}</p>
        </div>

        <div className="inline-flex items-center justify-between rounded-full border border-[var(--maurie-border)] bg-[var(--maurie-text)] px-4 py-3 text-sm font-semibold text-[var(--maurie-inverted-text)] transition group-hover:bg-[var(--maurie-brown)]">
          <span>Continue</span>
          <span aria-hidden="true">→</span>
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