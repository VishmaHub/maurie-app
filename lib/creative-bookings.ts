import { prisma } from "@/lib/prisma";

export interface CreativeBookingListItem {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: string;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly locationLabel: string | null;
  readonly meetingUrl: string | null;
  readonly clientName: string;
  readonly clientEmail: string | null;
  readonly createdAt: Date;
}

export interface CreativeBookingDetail {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: string;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly locationLabel: string | null;
  readonly meetingUrl: string | null;
  readonly clientName: string;
  readonly clientEmail: string | null;
  readonly clientPhoneE164: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

function getBookingEndTime(input: {
  readonly scheduledTime: Date;
  readonly durationMinutes: number;
}): Date {
  return new Date(input.scheduledTime.getTime() + input.durationMinutes * 60 * 1000);
}

function getBookingTitle(clientName: string): string {
  if (clientName.trim().length === 0) {
    return "Creative booking";
  }

  return `Booking with ${clientName}`;
}

export async function getCreativeBookings(
  userId: string
): Promise<readonly CreativeBookingListItem[]> {
  const bookings = await prisma.booking.findMany({
    where: {
      creativeId: userId
    },
    orderBy: {
      scheduledTime: "asc"
    },
    select: {
      id: true,
      clientName: true,
      clientEmail: true,
      status: true,
      scheduledTime: true,
      durationMinutes: true,
      notes: true,
      createdAt: true
    }
  });

  return bookings.map(
    (booking): CreativeBookingListItem => ({
      id: booking.id,
      title: getBookingTitle(booking.clientName),
      description: booking.notes,
      status: booking.status,
      startsAt: booking.scheduledTime,
      endsAt: getBookingEndTime({
        scheduledTime: booking.scheduledTime,
        durationMinutes: booking.durationMinutes
      }),
      locationLabel: null,
      meetingUrl: null,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      createdAt: booking.createdAt
    })
  );
}

export async function getCreativeBookingDetail(input: {
  readonly userId: string;
  readonly bookingId: string;
}): Promise<CreativeBookingDetail | null> {
  const booking = await prisma.booking.findFirst({
    where: {
      id: input.bookingId,
      creativeId: input.userId
    },
    select: {
      id: true,
      clientName: true,
      clientEmail: true,
      clientPhoneE164: true,
      status: true,
      scheduledTime: true,
      durationMinutes: true,
      notes: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (booking === null) {
    return null;
  }

  return {
    id: booking.id,
    title: getBookingTitle(booking.clientName),
    description: booking.notes,
    status: booking.status,
    startsAt: booking.scheduledTime,
    endsAt: getBookingEndTime({
      scheduledTime: booking.scheduledTime,
      durationMinutes: booking.durationMinutes
    }),
    locationLabel: null,
    meetingUrl: null,
    clientName: booking.clientName,
    clientEmail: booking.clientEmail,
    clientPhoneE164: booking.clientPhoneE164,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  };
}
