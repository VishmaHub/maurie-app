import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3 rounded-3xl px-2 py-2 transition duration-300 ease-out hover:bg-white/40 dark:hover:bg-white/10"
      aria-label="Go to Mauri-E home"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(89,55,50,0.16)] bg-[linear-gradient(135deg,var(--maurie-yellow),var(--maurie-orange))] text-sm font-black tracking-tight text-[var(--maurie-black)] shadow-[0_14px_34px_rgba(234,109,48,0.24)]">
        ME
      </div>

      <div className="leading-tight">
        <p className="text-sm font-bold tracking-tight text-[var(--maurie-text)]">Mauri-E</p>
        <p className="text-xs text-[var(--maurie-muted)]">Purpose-led ecosystem</p>
      </div>
    </Link>
  );
}
