import { prisma } from "@/lib/prisma";

export interface AdminBookingListItem {
  readonly id: string;
  readonly creativeId: string;
  readonly creativeName: string;
  readonly creativeEmail: string;
  readonly clientId: string | null;
  readonly clientName: string;
  readonly clientEmail: string;
  readonly clientPhoneE164: string | null;
  readonly status: string;
  readonly scheduledTime: Date;
  readonly endsAt: Date;
  readonly durationMinutes: number;
  readonly notes: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminBookingDetail {
  readonly id: string;
  readonly creativeId: string;
  readonly creativeName: string;
  readonly creativeEmail: string;
  readonly clientId: string | null;
  readonly clientName: string;
  readonly clientEmail: string;
  readonly clientPhoneE164: string | null;
  readonly status: string;
  readonly scheduledTime: Date;
  readonly endsAt: Date;
  readonly durationMinutes: number;
  readonly notes: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

interface UserLookupValue {
  readonly email: string;
  readonly displayName: string | null;
}

function getBookingEndTime(input: {
  readonly scheduledTime: Date;
  readonly durationMinutes: number;
}): Date {
  return new Date(input.scheduledTime.getTime() + input.durationMinutes * 60 * 1000);
}

function getDisplayName(user: UserLookupValue | undefined, fallback: string): string {
  if (user === undefined) {
    return fallback;
  }

  return user.displayName ?? user.email;
}

async function getUserLookup(userIds: readonly string[]): Promise<Map<string, UserLookupValue>> {
  const uniqueUserIds: string[] = Array.from(new Set(userIds));

  if (uniqueUserIds.length === 0) {
    return new Map<string, UserLookupValue>();
  }

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: uniqueUserIds
      }
    },
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          displayName: true
        }
      }
    }
  });

  return new Map(
    users.map((user) => [
      user.id,
      {
        email: user.email,
        displayName: user.profile?.displayName ?? null
      }
    ])
  );
}

export async function getAdminBookings(): Promise<readonly AdminBookingListItem[]> {
  const bookings = await prisma.booking.findMany({
    orderBy: {
      scheduledTime: "desc"
    },
    select: {
      id: true,
      creativeId: true,
      clientId: true,
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

  const userIds: string[] = bookings.flatMap((booking): string[] => {
    if (booking.clientId === null) {
      return [booking.creativeId];
    }

    return [booking.creativeId, booking.clientId];
  });

  const userLookup: Map<string, UserLookupValue> = await getUserLookup(userIds);

  return bookings.map((booking): AdminBookingListItem => {
    const creative = userLookup.get(booking.creativeId);

    return {
      id: booking.id,
      creativeId: booking.creativeId,
      creativeName: getDisplayName(creative, "Unnamed creative"),
      creativeEmail: creative?.email ?? "Not available",
      clientId: booking.clientId,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientPhoneE164: booking.clientPhoneE164,
      status: booking.status,
      scheduledTime: booking.scheduledTime,
      endsAt: getBookingEndTime({
        scheduledTime: booking.scheduledTime,
        durationMinutes: booking.durationMinutes
      }),
      durationMinutes: booking.durationMinutes,
      notes: booking.notes,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };
  });
}

export async function getAdminBookingDetail(bookingId: string): Promise<AdminBookingDetail | null> {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId
    },
    select: {
      id: true,
      creativeId: true,
      clientId: true,
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

  const userIds: string[] =
    booking.clientId === null ? [booking.creativeId] : [booking.creativeId, booking.clientId];

  const userLookup: Map<string, UserLookupValue> = await getUserLookup(userIds);
  const creative = userLookup.get(booking.creativeId);

  return {
    id: booking.id,
    creativeId: booking.creativeId,
    creativeName: getDisplayName(creative, "Unnamed creative"),
    creativeEmail: creative?.email ?? "Not available",
    clientId: booking.clientId,
    clientName: booking.clientName,
    clientEmail: booking.clientEmail,
    clientPhoneE164: booking.clientPhoneE164,
    status: booking.status,
    scheduledTime: booking.scheduledTime,
    endsAt: getBookingEndTime({
      scheduledTime: booking.scheduledTime,
      durationMinutes: booking.durationMinutes
    }),
    durationMinutes: booking.durationMinutes,
    notes: booking.notes,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  };
}
