import Link from "next/link";

interface RegisterRoleCardProps {
  readonly title: string;
  readonly description: string;
  readonly href?: string;
  readonly label: string;
  readonly isDisabled?: boolean;
}

export function RegisterRoleCard(props: RegisterRoleCardProps) {
  const href = props.href;
  const isDisabled = props.isDisabled ?? false;

  const className =
    "maurie-glass-soft block rounded-3xl p-6 transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/70";

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            {props.title}
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--maurie-muted)]">
            {props.description}
          </p>
        </div>

        <span className="maurie-pill shrink-0">{props.label}</span>
      </div>
    </>
  );

  if (isDisabled || typeof href !== "string") {
    return (
      <div className={`${className} cursor-not-allowed opacity-70`} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}