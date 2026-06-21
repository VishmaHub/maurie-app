import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { getClientInvoices } from "@/lib/client-invoices";
import { formatCurrencyFromCents, formatDate } from "@/lib/formatters";

function getInvoiceStatusTone(status: string): "yellow" | "orange" | "neutral" {
  if (status === "PAID") {
    return "yellow";
  }

  if (status === "OVERDUE" || status === "ISSUED" || status === "PARTIALLY_PAID") {
    return "orange";
  }

  return "neutral";
}

export default async function ClientFinancialsPage() {
  const session = await requireRole("CLIENT");

  await writeAuditLog({
    actorId: session.userId,
    action: "CLIENT_DATA_READ",
    resourceType: "ClientInvoices",
    resourceId: "client-invoice-list"
  });

  const invoices = await getClientInvoices(session.userId);

  const outstandingAmountCents: number = invoices
    .filter((invoice) => invoice.paymentStatus !== "PAID")
    .reduce((total, invoice) => total + invoice.amountCents, 0);

  const paidAmountCents: number = invoices
    .filter((invoice) => invoice.paymentStatus === "PAID")
    .reduce((total, invoice) => total + invoice.amountCents, 0);

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Client Financials
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Invoice and payment centre.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            View Mauri-E invoices, GST details, due dates, payment status, and project-linked
            billing records from a secured client workspace.
          </p>
        </div>

        <Link href="/dashboard/client" className="maurie-button-secondary">
          Back to Dashboard
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Total Invoices</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">{invoices.length}</p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Outstanding</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {formatCurrencyFromCents(outstandingAmountCents, "AUD")}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Paid</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {formatCurrencyFromCents(paidAmountCents, "AUD")}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {invoices.length === 0 ? (
          <div className="maurie-glass-soft rounded-3xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              No invoices found.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Once Mauri-E issues an invoice to your account, it will appear here.
            </p>
          </div>
        ) : (
          invoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/dashboard/client/financials/${invoice.id}`}
              className="maurie-glass-soft group rounded-3xl p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(89,55,50,0.16)]"
            >
              <article>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                      {invoice.invoiceNumber}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--maurie-text)]">
                      {formatCurrencyFromCents(invoice.amountCents, invoice.currency)}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
                      Linked to {invoice.projectCode} · {invoice.projectTitle}
                    </p>
                  </div>

                  <StatusBadge
                    label={invoice.paymentStatus}
                    tone={getInvoiceStatusTone(invoice.paymentStatus)}
                  />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">GST</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatCurrencyFromCents(invoice.gstCents, invoice.currency)}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Tax Status</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {invoice.taxStatus}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Issued</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDate(invoice.issuedAt)}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Due</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDate(invoice.dueAt)}
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          ))
        )}
      </section>
    </AppShell>
  );
}
