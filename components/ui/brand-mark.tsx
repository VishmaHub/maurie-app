import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3 rounded-3xl px-2 py-2 transition duration-300 ease-out hover:bg-black/5 dark:hover:bg-white/10"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white/70 text-sm font-semibold tracking-tight text-zinc-950 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-white">
        ME
      </div>

      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Mauri-E
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Project Ecosystem</p>
      </div>
    </Link>
  );
}
