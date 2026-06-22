import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminBookingDetail } from "@/lib/admin-bookings";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/formatters";

interface AdminBookingDetailPageProps {
  readonly params: Promise<{
    readonly bookingId: string;
  }>;
}

function getBookingStatusTone(status: string): "yellow" | "orange" | "neutral" {
  if (status === "CONFIRMED" || status === "COMPLETED") {
    return "yellow";
  }

  if (status === "CANCELLED" || status === "DECLINED") {
    return "orange";
  }

  return "neutral";
}

export default async function AdminBookingDetailPage(props: AdminBookingDetailPageProps) {
  const session = await requireRole("ADMIN");
  const params = await props.params;

  const booking = await getAdminBookingDetail(params.bookingId);

  if (booking === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "AdminBooking",
      resourceId: params.bookingId,
      metadata: {
        reason: "booking-not-found"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminBooking",
    resourceId: booking.id
  });

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Booking Record
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Booking with {booking.clientName}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            Scheduled with {booking.creativeName} from {formatDateTime(booking.scheduledTime)} to{" "}
            {formatDateTime(booking.endsAt)}.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/admin/bookings" className="maurie-button-secondary">
            Back to Bookings
          </Link>

          <StatusBadge label={booking.status} tone={getBookingStatusTone(booking.status)} />
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Status</p>
          <div className="mt-3">
            <StatusBadge label={booking.status} tone={getBookingStatusTone(booking.status)} />
          </div>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Start</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDateTime(booking.scheduledTime)}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">End</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDateTime(booking.endsAt)}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Duration</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {booking.durationMinutes} mins
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Client Account</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {booking.clientId === null ? "External" : "Linked"}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Booking Contact Details
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Client Name</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {booking.clientName}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Client Email</p>
              <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                {booking.clientEmail}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Client Phone</p>
              <p className="mt-1 break-words text-sm font-semibold text-[var(--maurie-text)]">
                {booking.clientPhoneE164 ?? "Not recorded"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Notes</p>
              <p className="mt-1 text-sm leading-6 text-[var(--maurie-text)]">
                {booking.notes ?? "No booking notes available."}
              </p>
            </div>
          </div>
        </div>

        <aside className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Creative & Metadata
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Creative</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {booking.creativeName}
              </p>
              <p className="mt-1 break-words text-xs text-[var(--maurie-muted)]">
                {booking.creativeEmail}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Booking ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {booking.id}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Creative ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {booking.creativeId}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Client ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--maurie-text)]">
                {booking.clientId ?? "External booking"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Created</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {formatDateTime(booking.createdAt)}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Updated</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {formatDateTime(booking.updatedAt)}
              </p>
            </div>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
