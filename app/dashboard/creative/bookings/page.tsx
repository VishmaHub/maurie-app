import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { getCreativeBookings } from "@/lib/creative-bookings";
import { formatDateTime } from "@/lib/formatters";

function getBookingStatusTone(status: string): "yellow" | "orange" | "neutral" {
  if (status === "CONFIRMED" || status === "COMPLETED") {
    return "yellow";
  }

  if (status === "PENDING") {
    return "orange";
  }

  return "neutral";
}

export default async function CreativeBookingsPage() {
  const session = await requireRole("CREATIVE");

  await writeAuditLog({
    actorId: session.userId,
    action: "CREATIVE_DATA_READ",
    resourceType: "CreativeBookings",
    resourceId: "creative-booking-list"
  });

  const bookings = await getCreativeBookings(session.userId);

  const upcomingBookings = bookings.filter((booking) => booking.startsAt >= new Date());
  const completedBookings = bookings.filter((booking) => booking.status === "COMPLETED");

  return (
    <AppShell role={session.role}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Creative Bookings
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--maurie-text)]">
            Booking schedule.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--maurie-muted)]">
            View assigned client bookings, meeting details, session status, timing, and location
            from your secured Mauri-E creative workspace.
          </p>
        </div>

        <Link href="/dashboard/creative" className="maurie-button-secondary">
          Back to Dashboard
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Total Bookings</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">{bookings.length}</p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Upcoming</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {upcomingBookings.length}
          </p>
        </div>

        <div className="maurie-glass-soft rounded-3xl p-5">
          <p className="text-sm text-[var(--maurie-muted)]">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--maurie-text)]">
            {completedBookings.length}
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
              Once a booking is assigned to your creative profile, it will appear here.
            </p>
          </div>
        ) : (
          bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/dashboard/creative/bookings/${booking.id}`}
              className="maurie-glass-soft group rounded-3xl p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(89,55,50,0.16)]"
            >
              <article>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--maurie-muted)]">
                      {formatDateTime(booking.startsAt)}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--maurie-text)]">
                      {booking.title}
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--maurie-muted)]">
                      {booking.description ?? "No booking description has been added yet."}
                    </p>
                  </div>

                  <StatusBadge label={booking.status} tone={getBookingStatusTone(booking.status)} />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Client</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {booking.clientName}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Start</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDateTime(booking.startsAt)}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">End</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {formatDateTime(booking.endsAt)}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
                    <p className="text-xs text-[var(--maurie-muted)]">Location</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                      {booking.locationLabel ?? "Not added"}
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
