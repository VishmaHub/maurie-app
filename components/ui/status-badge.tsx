interface StatusBadgeProps {
  readonly label: string;
  readonly tone?: "yellow" | "orange" | "neutral";
}

export function StatusBadge(props: StatusBadgeProps) {
  const tone: "yellow" | "orange" | "neutral" = props.tone ?? "neutral";

  const classNameByTone: Record<typeof tone, string> = {
    yellow: "bg-[var(--maurie-yellow)] text-[var(--maurie-black)]",
    orange: "bg-[var(--maurie-orange)] text-[var(--maurie-black)]",
    neutral: "bg-white/60 text-[var(--maurie-brown)]"
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${classNameByTone[tone]}`}
    >
      {props.label}
    </span>
  );
}
