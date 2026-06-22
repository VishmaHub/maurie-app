import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAdminBookings } from "@/lib/admin-bookings";
import { requireRole } from "@/lib/auth/require-role";
import { formatDate, formatDateTime } from "@/lib/formatters";

function getBookingStatusTone(status: string): "yellow" | "orange" | "neutral" {
  if (status === "CONFIRMED" || status === "COMPLETED") {
    return "yellow";
  }

  if (status === "CANCELLED" || status === "DECLINED") {
    return "orange";
  }

  return "neutral";
}

export default async function AdminBookingsPage() {
  const session = await requireRole("ADMIN");

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_DATA_READ",
    resourceType: "AdminBookings",
    resourceId: "admin-booking-records"
  });

  const bookings = await getAdminBookings();

  const now = new Date();

  const upcomingBookings = bookings.filter((booking) => booking.scheduledTime >= now);
  const pastBookings = bookings.filter((booking) => booking.scheduledTime < now);
  const completedBookings = bookings.filter((booking) => booking.status === "COMPLETED");
  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "CANCELLED" || booking.status === "DECLINED"
  );

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Admin Booking Records
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Booking operations.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            View creative booking records, client details, booking status, schedule, duration, and
            internal notes from an admin-only Mauri-E workspace.
          </p>
        </div>

        <Link href="/dashboard/admin" className="maurie-button-secondary">
          Back to Admin
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Bookings</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">{bookings.length}</p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Upcoming</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {upcomingBookings.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Past</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {pastBookings.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {completedBookings.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Cancelled</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {cancelledBookings.length}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {bookings.length === 0 ? (
          <div className="maurie-glass-soft rounded-3xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--maurie-text)]">
              No bookings found.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">
              Booking records will appear here once they are created.
            </p>
          </div>
        ) : (
          bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/dashboard/admin/bookings/${booking.id}`}
              className="maurie-glass-soft group rounded-3xl p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(89,55,50,0.16)]"
            >
              <article>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                      {formatDateTime(booking.scheduledTime)}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--maurie-text)]">
                      Booking with {booking.clientName}
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
                      Creative: {booking.creativeName} · Client: {booking.clientEmail}
                    </p>
                  </div>

                  <StatusBadge label={booking.status} tone={getBookingStatusTone(booking.status)} />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-5">
                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Creative</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {booking.creativeName}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Client</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {booking.clientName}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Duration</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {booking.durationMinutes} mins
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">End</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDateTime(booking.endsAt)}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Created</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDate(booking.createdAt)}
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
