import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminPlatformSearchData } from "@/lib/admin-platform-search";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/formatters";

interface AdminSearchPageProps {
  readonly searchParams: Promise<{
    readonly q?: string;
  }>;
}

function getResultTone(type: string): "yellow" | "orange" | "neutral" {
  if (type === "USER" || type === "PROJECT" || type === "LISTING") {
    return "yellow";
  }

  if (type === "EOI" || type === "CAMPAIGN_ROOM") {
    return "orange";
  }

  return "neutral";
}

function getResultLabel(type: string): string {
  return type.replaceAll("_", " ");
}

export default async function AdminSearchPage(props: AdminSearchPageProps) {
  const session = await requireRole("ADMIN");
  const searchParams = await props.searchParams;
  const query = searchParams.q ?? "";

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminPlatformSearch",
    resourceId: "admin-platform-search",
    metadata: {
      queryLength: query.length
    }
  });

  const searchData = await getAdminPlatformSearchData(query);

  const userResults = searchData.results.filter((result) => result.type === "USER");
  const projectResults = searchData.results.filter((result) => result.type === "PROJECT");
  const invoiceResults = searchData.results.filter((result) => result.type === "INVOICE");
  const protectedResults = searchData.results.filter(
    (result) => result.type === "EOI" || result.type === "CAMPAIGN_ROOM"
  );

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Admin Platform Search
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Search the operating system.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            Search across platform users, projects, invoices, bookings, listings, creative profiles,
            campaign rooms, and secure EOI records from an admin-only Mauri-E workspace.
          </p>
        </div>

        <Link href="/dashboard/admin" className="maurie-button-secondary">
          Back to Admin
        </Link>
      </div>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-5">
        <form
          action="/dashboard/admin/search"
          method="get"
          className="grid gap-4 md:grid-cols-[1fr_auto]"
        >
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--maurie-text)]">Search query</span>
            <input
              name="q"
              type="search"
              defaultValue={searchData.query}
              placeholder="Search by name, email, project code, invoice number, listing slug..."
              className="rounded-2xl border border-[var(--maurie-border)] bg-white/70 px-4 py-3 text-sm text-[var(--maurie-text)] outline-none transition focus:border-[var(--maurie-orange)]"
            />
          </label>

          <button type="submit" className="maurie-button-primary self-end">
            Search
          </button>
        </form>

        {searchData.query.length > 0 && searchData.query.length < 2 ? (
          <p className="mt-4 text-sm text-[var(--maurie-muted)]">
            Enter at least 2 characters to search.
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Results</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {searchData.results.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Users</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {userResults.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Projects</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {projectResults.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Invoices</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {invoiceResults.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Protected</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {protectedResults.length}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {searchData.query.length === 0 ? (
          <div className="maurie-glass-soft rounded-3xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              Start with a search term.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Try searching for a client name, user email, project code, invoice number, listing
              slug, campaign code, or EOI reference.
            </p>
          </div>
        ) : null}

        {searchData.query.length >= 2 && searchData.results.length === 0 ? (
          <div className="maurie-glass-soft rounded-3xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              No matching records found.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Try a different name, email, code, invoice number, or slug.
            </p>
          </div>
        ) : null}

        {searchData.results.map((result) => (
          <Link
            key={`${result.type}-${result.id}`}
            href={result.href}
            className="maurie-glass-soft group rounded-3xl p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(89,55,50,0.16)]"
          >
            <article>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                    {getResultLabel(result.type)}
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--maurie-text)]">
                    {result.title}
                  </h2>

                  <p className="mt-2 text-sm font-semibold text-[var(--maurie-muted)]">
                    {result.subtitle}
                  </p>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
                    {result.description}
                  </p>
                </div>

                <StatusBadge
                  label={getResultLabel(result.type)}
                  tone={getResultTone(result.type)}
                />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                  <p className="text-xs text-[var(--maurie-muted)]">Record ID</p>
                  <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                    {result.id}
                  </p>
                </div>

                <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                  <p className="text-xs text-[var(--maurie-muted)]">Created</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                    {formatDateTime(result.createdAt)}
                  </p>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
