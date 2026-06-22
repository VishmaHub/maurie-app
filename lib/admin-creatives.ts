import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export interface AdminCreativeListItem {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly displayName: string;
  readonly publicSlug: string | null;
  readonly assignedProjectCount: number;
  readonly bookingCount: number;
  readonly portfolioItemCount: number;
  readonly hasPublicCreativeProfile: boolean;
  readonly creativeHandle: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminCreativeProject {
  readonly id: string;
  readonly projectCode: string;
  readonly title: string;
  readonly summary: string | null;
  readonly status: string;
  readonly clientId: string;
  readonly clientName: string;
  readonly clientEmail: string;
  readonly startsAt: Date | null;
  readonly endsAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminCreativeBooking {
  readonly id: string;
  readonly clientId: string | null;
  readonly clientName: string;
  readonly clientEmail: string;
  readonly clientPhoneE164: string | null;
  readonly status: string;
  readonly scheduledTime: Date;
  readonly durationMinutes: number;
  readonly notes: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminCreativePublicProfile {
  readonly id: string;
  readonly publicHandle: string;
  readonly headline: string;
  readonly bio: string | null;
  readonly locationLabel: string | null;
  readonly websiteUrl: string | null;
  readonly contactEmail: string | null;
  readonly isPublished: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminCreativePortfolioItem {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly description: string | null;
  readonly mediaUrl: string | null;
  readonly externalUrl: string | null;
  readonly sortOrder: number;
  readonly isPublished: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminCreativeDetail {
  readonly id: string;
  readonly email: string;
  readonly normalizedEmail: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly profile: {
    readonly displayName: string;
    readonly publicSlug: string | null;
    readonly bio: string | null;
    readonly isPublic: boolean;
  } | null;
  readonly publicCreativeProfile: AdminCreativePublicProfile | null;
  readonly projects: readonly AdminCreativeProject[];
  readonly bookings: readonly AdminCreativeBooking[];
  readonly portfolioItems: readonly AdminCreativePortfolioItem[];
}

function getDisplayName(profile: { readonly displayName: string } | null): string {
  if (profile === null) {
    return "Unnamed creative";
  }

  return profile.displayName;
}

export async function getAdminCreatives(): Promise<readonly AdminCreativeListItem[]> {
  const creatives = await prisma.user.findMany({
    where: {
      role: "CREATIVE"
    },
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          displayName: true,
          publicSlug: true
        }
      }
    }
  });

  const creativeIds: string[] = creatives.map((creative): string => creative.id);

  const [projects, bookings, publicProfiles, portfolioItems] = await Promise.all([
    prisma.project.findMany({
      where: {
        creativeId: {
          in: creativeIds
        }
      },
      select: {
        creativeId: true
      }
    }),
    prisma.booking.findMany({
      where: {
        creativeId: {
          in: creativeIds
        }
      },
      select: {
        creativeId: true
      }
    }),
    prisma.creativeProfilePage.findMany({
      where: {
        creativeId: {
          in: creativeIds
        }
      },
      select: {
        creativeId: true,
        publicHandle: true,
        isPublished: true
      }
    }),
    prisma.creativePortfolioItem.findMany({
      where: {
        creativeId: {
          in: creativeIds
        }
      },
      select: {
        creativeId: true
      }
    })
  ]);

  return creatives.map((creative): AdminCreativeListItem => {
    const creativeProjects = projects.filter(
      (project): boolean => project.creativeId === creative.id
    );

    const creativeBookings = bookings.filter(
      (booking): boolean => booking.creativeId === creative.id
    );

    const creativePublicProfile = publicProfiles.find(
      (publicProfile): boolean => publicProfile.creativeId === creative.id
    );

    const creativePortfolioItems = portfolioItems.filter(
      (portfolioItem): boolean => portfolioItem.creativeId === creative.id
    );

    return {
      id: creative.id,
      email: creative.email,
      role: creative.role,
      isActive: creative.isActive,
      displayName: getDisplayName(creative.profile),
      publicSlug: creative.profile?.publicSlug ?? null,
      assignedProjectCount: creativeProjects.length,
      bookingCount: creativeBookings.length,
      portfolioItemCount: creativePortfolioItems.length,
      hasPublicCreativeProfile: creativePublicProfile !== undefined,
      creativeHandle: creativePublicProfile?.publicHandle ?? null,
      createdAt: creative.createdAt,
      updatedAt: creative.updatedAt
    };
  });
}

export async function getAdminCreativeDetail(
  creativeId: string
): Promise<AdminCreativeDetail | null> {
  const creative = await prisma.user.findFirst({
    where: {
      id: creativeId,
      role: "CREATIVE"
    },
    select: {
      id: true,
      email: true,
      normalizedEmail: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          displayName: true,
          publicSlug: true,
          bio: true,
          isPublic: true
        }
      }
    }
  });

  if (creative === null) {
    return null;
  }

  const [projects, bookings, publicCreativeProfile, portfolioItems] = await Promise.all([
    prisma.project.findMany({
      where: {
        creativeId: creative.id
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        projectCode: true,
        title: true,
        summary: true,
        status: true,
        clientId: true,
        startsAt: true,
        endsAt: true,
        createdAt: true,
        updatedAt: true,
        client: {
          select: {
            email: true,
            profile: {
              select: {
                displayName: true
              }
            }
          }
        }
      }
    }),
    prisma.booking.findMany({
      where: {
        creativeId: creative.id
      },
      orderBy: {
        scheduledTime: "desc"
      },
      select: {
        id: true,
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
    }),
    prisma.creativeProfilePage.findUnique({
      where: {
        creativeId: creative.id
      },
      select: {
        id: true,
        publicHandle: true,
        headline: true,
        bio: true,
        locationLabel: true,
        websiteUrl: true,
        contactEmail: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true
      }
    }),
    prisma.creativePortfolioItem.findMany({
      where: {
        creativeId: creative.id
      },
      orderBy: {
        sortOrder: "asc"
      },
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        mediaUrl: true,
        externalUrl: true,
        sortOrder: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true
      }
    })
  ]);

  return {
    id: creative.id,
    email: creative.email,
    normalizedEmail: creative.normalizedEmail,
    role: creative.role,
    isActive: creative.isActive,
    createdAt: creative.createdAt,
    updatedAt: creative.updatedAt,
    profile: creative.profile,
    publicCreativeProfile,
    projects: projects.map(
      (project): AdminCreativeProject => ({
        id: project.id,
        projectCode: project.projectCode,
        title: project.title,
        summary: project.summary,
        status: project.status,
        clientId: project.clientId,
        clientName: getDisplayName(project.client.profile),
        clientEmail: project.client.email,
        startsAt: project.startsAt,
        endsAt: project.endsAt,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      })
    ),
    bookings,
    portfolioItems
  };
}
