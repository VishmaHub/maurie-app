import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminInvoiceDetail } from "@/lib/admin-invoices";
import { requireRole } from "@/lib/auth/require-role";
import { formatCurrencyFromCents, formatDate, formatDateTime } from "@/lib/formatters";

interface AdminInvoiceDetailPageProps {
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

export default async function AdminInvoiceDetailPage(props: AdminInvoiceDetailPageProps) {
  const session = await requireRole("ADMIN");
  const params = await props.params;

  const invoice = await getAdminInvoiceDetail(params.invoiceId);

  if (invoice === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "AdminInvoice",
      resourceId: params.invoiceId,
      metadata: {
        reason: "invoice-not-found"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminInvoice",
    resourceId: invoice.id
  });

  const subtotalCents: number = invoice.amountCents - invoice.gstCents;
  const amountDueCents: number = invoice.paymentStatus === "PAID" ? 0 : invoice.amountCents;

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
            Invoice for {invoice.client.name}, linked to {invoice.project.projectCode} ·{" "}
            {invoice.project.title}.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/admin/invoices" className="maurie-button-secondary">
            Back to Invoices
          </Link>

          <StatusBadge
            label={invoice.paymentStatus}
            tone={getInvoiceStatusTone(invoice.paymentStatus)}
          />
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
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
          <p className="text-sm text-[var(--maurie-muted)]">Amount Due</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {formatCurrencyFromCents(amountDueCents, invoice.currency)}
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
            Invoice Ownership
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Client</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {invoice.client.name}
              </p>
              <p className="mt-1 break-words text-xs text-[var(--maurie-muted)]">
                {invoice.client.email}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Project</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {invoice.project.projectCode} · {invoice.project.title}
              </p>
              <p className="mt-1 text-xs text-[var(--maurie-muted)]">
                Status: {invoice.project.status}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Creative</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {invoice.project.creativeName}
              </p>
              <p className="mt-1 break-words text-xs text-[var(--maurie-muted)]">
                {invoice.project.creativeEmail}
              </p>
            </div>
          </div>
        </div>

        <aside className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Billing Timeline
          </h2>

          <div className="mt-5 grid gap-3">
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

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Created</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {formatDateTime(invoice.createdAt)}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Updated</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {formatDateTime(invoice.updatedAt)}
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="maurie-glass-soft mt-8 rounded-3xl p-5">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
          Invoice Metadata
        </h2>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">Invoice ID</p>
            <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
              {invoice.id}
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">Client ID</p>
            <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
              {invoice.client.id}
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">Project ID</p>
            <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
              {invoice.project.id}
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
