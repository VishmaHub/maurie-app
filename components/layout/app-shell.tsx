import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import { LogoutButton } from "@/components/layout/logout-button";
import { getVisibleNavigation, ROLE_LABELS, type NavigationItem } from "@/lib/navigation";
import type { UserRole } from "@/types/user-role";

interface AppShellProps {
  readonly children: ReactNode;
  readonly role: UserRole;
}

export function AppShell(props: AppShellProps) {
  const navigationItems: readonly NavigationItem[] = getVisibleNavigation(props.role);

  return (
    <div className="maurie-app-background min-h-dvh">
      <div className="mx-auto grid min-h-dvh w-full max-w-[1600px] grid-cols-1 gap-4 p-4 lg:grid-cols-[300px_1fr] lg:p-6">
        <aside className="maurie-glass flex flex-col rounded-[2rem] p-5 lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)]">
          <div className="flex items-center gap-3">
            <BrandMark />

            <div>
              <p className="text-sm font-black tracking-tight text-[var(--maurie-text)]">Mauri-E</p>
              <p className="text-xs font-medium text-[var(--maurie-muted)]">
                {ROLE_LABELS[props.role]} Workspace
              </p>
            </div>
          </div>

          <nav className="mt-8 grid gap-2">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href} className="maurie-nav-link">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-3xl border border-[var(--maurie-soft-border)] bg-white/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--maurie-muted)]">
              Secure Session
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Role-based access is active for this workspace.
            </p>
          </div>
        </aside>

        <main className="flex min-w-0 flex-col">
          <header className="maurie-glass flex items-center justify-between rounded-[2rem] p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--maurie-muted)]">
                {ROLE_LABELS[props.role]}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                Mauri-E Operating System
              </p>
            </div>

            <LogoutButton />
          </header>

          <div className="py-6">{props.children}</div>
        </main>
      </div>
    </div>
  );
}
