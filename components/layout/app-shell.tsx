import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/layout/logout-button";
import { BrandMark } from "@/components/ui/brand-mark";
import { ROLE_LABELS, ROLE_NAVIGATION, type NavigationItem } from "@/lib/navigation";
import type { UserRole } from "@/types/user-role";

interface AppShellProps {
  readonly children: ReactNode;
  readonly role: UserRole;
}

function getVisibleNavigation(role: UserRole): readonly NavigationItem[] {
  return ROLE_NAVIGATION[role].filter((item: NavigationItem): boolean =>
    item.allowedRoles.includes(role)
  );
}

function SidebarNavigation(props: {
  readonly role: UserRole;
  readonly navigationItems: readonly NavigationItem[];
}) {
  return (
    <aside className="maurie-glass hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-80 lg:flex-col lg:px-5 lg:py-6">
      <div className="flex items-center justify-between">
        <BrandMark />
      </div>

      <div className="maurie-pill mt-8 rounded-full px-3 py-1 text-xs font-semibold">
        {ROLE_LABELS[props.role]}
      </div>

      <nav
        aria-label="Primary navigation"
        className="mt-8 flex flex-1 flex-col gap-2 overflow-y-auto pb-6"
      >
        {props.navigationItems.map((item: NavigationItem) => (
          <Link
            key={item.href}
            href={item.href}
            className="maurie-nav-link group rounded-3xl px-4 py-3"
          >
            <span className="block text-sm font-semibold tracking-tight text-[var(--maurie-text)]">
              {item.label}
            </span>
            <span className="mt-1 block text-xs leading-5 text-[var(--maurie-muted)]">
              {item.description}
            </span>
          </Link>
        ))}
      </nav>

      <div className="maurie-glass-soft mt-auto rounded-3xl p-4 text-xs leading-5 text-[var(--maurie-muted)]">
        Role-aware interface is active. Server-side session checks now control dashboard access and
        navigation visibility.
      </div>
    </aside>
  );
}

function TopHeader(props: { readonly role: UserRole }) {
  return (
    <header className="maurie-glass sticky top-0 z-20 border-x-0 border-t-0">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="lg:hidden">
          <BrandMark />
        </div>

        <div className="hidden lg:block">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--maurie-muted)]">
            Mauri-E Command Layer
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Business, creative, and collaboration operations in one secure workspace.
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="maurie-pill rounded-full px-3 py-1 text-xs font-semibold">
            {ROLE_LABELS[props.role]}
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

function MobileNavigation(props: { readonly navigationItems: readonly NavigationItem[] }) {
  return (
    <nav className="maurie-glass fixed inset-x-3 bottom-3 z-40 rounded-[2rem] p-2 lg:hidden">
      <div className="grid grid-cols-4 gap-1">
        {props.navigationItems.slice(0, 4).map((item: NavigationItem) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-3xl px-2 py-3 text-center text-[0.7rem] font-medium text-[var(--maurie-muted)] transition duration-300 ease-out hover:bg-white/30"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function AppShell(props: AppShellProps) {
  const navigationItems: readonly NavigationItem[] = getVisibleNavigation(props.role);

  return (
    <div className="min-h-dvh">
      <SidebarNavigation role={props.role} navigationItems={navigationItems} />

      <div className="min-h-dvh lg:pl-80">
        <TopHeader role={props.role} />

        <main className="px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12">
          <div className="mx-auto max-w-7xl">
            <section className="maurie-glass rounded-[2rem] p-4 sm:p-6 lg:p-8">
              {props.children}
            </section>
          </div>
        </main>
      </div>

      <MobileNavigation navigationItems={navigationItems} />
    </div>
  );
}
