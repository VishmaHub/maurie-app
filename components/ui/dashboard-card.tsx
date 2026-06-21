import type { ReactNode } from "react";

interface DashboardCardProps {
  readonly title: string;
  readonly value: string;
  readonly description: string;
  readonly children?: ReactNode;
}

export function DashboardCard(props: DashboardCardProps) {
  return (
    <article className="maurie-glass-soft rounded-3xl p-5">
      <p className="text-sm font-medium text-[var(--maurie-muted)]">{props.title}</p>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--maurie-text)]">
        {props.value}
      </p>

      <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">{props.description}</p>

      {props.children !== undefined ? <div className="mt-5">{props.children}</div> : null}
    </article>
  );
}
