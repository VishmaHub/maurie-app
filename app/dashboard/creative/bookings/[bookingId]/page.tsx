import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { getCreativeBookingDetail } from "@/lib/creative-bookings";
import { formatDate, formatDateTime } from "@/lib/formatters";

interface CreativeBookingDetailPageProps {
  readonly params: Promise<{
    readonly bookingId: string;
  }>;
}

function getBookingStatusTone(status: string): "yellow" | "orange" | "neutral" {
  if (status === "CONFIRMED" || status === "COMPLETED") {
    return "yellow";
  }

  if (status === "PENDING") {
    return "orange";
  }

  return "neutral";
}

export default async function CreativeBookingDetailPage(props: CreativeBookingDetailPageProps) {
  const session = await requireRole("CREATIVE");
  const params = await props.params;

  const booking = await getCreativeBookingDetail({
    userId: session.userId,
    bookingId: params.bookingId
  });

  if (booking === null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "CreativeBooking",
      resourceId: params.bookingId,
      metadata: {
        reason: "booking-not-found-or-not-owned"
      }
    });

    notFound();
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "CREATIVE_DATA_READ",
    resourceType: "CreativeBooking",
    resourceId: booking.id
  });

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Creative Booking
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            {booking.title}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
            {booking.description ?? "No booking description has been added yet."}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/creative/bookings" className="maurie-button-secondary">
            Back to Bookings
          </Link>

          <StatusBadge label={booking.status} tone={getBookingStatusTone(booking.status)} />
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Client</p>
          <p className="mt-2 text-xl font-semibold text-[var(--maurie-text)]">
            {booking.clientName}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Start</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDateTime(booking.startsAt)}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">End</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDateTime(booking.endsAt)}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Created</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--maurie-text)]">
            {formatDate(booking.createdAt)}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Booking Details
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
                {booking.clientEmail ?? "Not added"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Location</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {booking.locationLabel ?? "Not added"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Meeting URL</p>
              {booking.meetingUrl === null ? (
                <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">Not added</p>
              ) : (
                <a
                  href={booking.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex break-all text-sm font-bold text-[var(--maurie-brown)]"
                >
                  Open meeting link
                </a>
              )}
            </div>
          </div>
        </div>

        <aside className="maurie-glass-soft rounded-3xl p-5">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Booking Status
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--maurie-muted)]">
            This booking record is visible only to the assigned creative user. Future updates can
            add status changes, reminders, calendar sync, and client confirmation workflows.
          </p>

          <div className="mt-5 rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">Current Status</p>
            <div className="mt-3">
              <StatusBadge label={booking.status} tone={getBookingStatusTone(booking.status)} />
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
            <p className="text-xs text-[var(--maurie-muted)]">Last Updated</p>
            <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
              {formatDateTime(booking.updatedAt)}
            </p>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
