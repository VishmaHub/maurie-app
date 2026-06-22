import Link from "next/link";

interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly actionHref?: string;
  readonly actionLabel?: string;
}

export function EmptyState(props: EmptyStateProps) {
  const hasAction: boolean =
    typeof props.actionHref === "string" && typeof props.actionLabel === "string";

  return (
    <div className="maurie-glass-soft rounded-3xl p-6">
      <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
        {props.title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
        {props.description}
      </p>

      {hasAction ? (
        <div className="mt-5">
          <Link href={props.actionHref as string} className="maurie-button-secondary">
            {props.actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
