import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { getClientInvoiceDetail } from "@/lib/client-invoices";
import { formatCurrencyFromCents, formatDate } from "@/lib/formatters";

interface ClientInvoiceDetailPageProps {
  readonly params: Promise<{
    readonly invoiceId: string;
  }>;
}

function getInvoiceStatusTone(status: string): "yellow" | "orange" | "neutral" {
  if (status === "PAID") {
    return "yellow";
  }

  if (status === "OVERDUE" || status === "ISSUED" || status === "PARTIALLY_PAID") {
    return "orange";
  }

  return "neutral";
}

export default async function ClientInvoiceDetailPage(props: ClientInvoiceDetailPageProps) {
  const session = await requireRole("CLIENT");
  const params = await props.params;

  const invoice = await getClientInvoiceDetail({
    userId: session.userId,
    invoiceId: params.invoiceId
  });

  if (invoice === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "ClientInvoice",
      resourceId: params.invoiceId,
      metadata: {
        reason: "invoice-not-found-or-not-owned"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "CLIENT_DATA_READ",
    resourceType: "ClientInvoice",
    resourceId: invoice.id
  });

  const subtotalCents: number = invoice.amountCents - invoice.gstCents;
  const isPaymentActionAvailable: boolean =
    invoice.paymentStatus === "ISSUED" ||
    invoice.paymentStatus === "OVERDUE" ||
    invoice.paymentStatus === "PARTIALLY_PAID";

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            {invoice.invoiceNumber}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            {formatCurrencyFromCents(invoice.amountCents, invoice.currency)}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            Invoice linked to {invoice.project.projectCode} · {invoice.project.title}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/client/financials" className="maurie-button-secondary">
            Back to Invoices
          </Link>
          <StatusBadge
            label={invoice.paymentStatus}
            tone={getInvoiceStatusTone(invoice.paymentStatus)}
          />
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Subtotal</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {formatCurrencyFromCents(subtotalCents, invoice.currency)}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">GST</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {formatCurrencyFromCents(invoice.gstCents, invoice.currency)}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Total</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {formatCurrencyFromCents(invoice.amountCents, invoice.currency)}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Tax Status</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {invoice.taxStatus}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Invoice Details
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Project</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {invoice.project.projectCode} · {invoice.project.title}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Creative Partner</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {invoice.project.creativeName}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Project Status</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {invoice.project.status}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
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

              <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                <p className="text-xs text-[var(--maurie-muted)]">Paid</p>
                <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                  {formatDate(invoice.paidAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Payment Action
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--maurie-muted)]">
            This panel is prepared for a future Stripe or payment gateway integration. For now, it
            confirms whether this invoice is eligible for payment action.
          </p>

          <div className="mt-5 rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">Gateway Status</p>
            <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
              {isPaymentActionAvailable ? "Payment-ready structure active" : "No payment required"}
            </p>
          </div>

          <div className="mt-5 rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">Amount Due</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--maurie-text)]">
              {invoice.paymentStatus === "PAID"
                ? formatCurrencyFromCents(0, invoice.currency)
                : formatCurrencyFromCents(invoice.amountCents, invoice.currency)}
            </p>
          </div>

          <button
            type="button"
            disabled
            className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-[var(--maurie-border)] bg-white/40 px-6 py-4 text-sm font-bold text-[var(--maurie-muted)]"
          >
            Gateway integration coming next
          </button>
        </aside>
      </section>
    </AppShell>
  );
}
