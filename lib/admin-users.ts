import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export interface AdminUserListItem {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly displayName: string;
  readonly publicSlug: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminUserDetail {
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
  readonly counts: {
    readonly projectsAsClient: number;
    readonly projectsAsCreative: number;
    readonly invoices: number;
    readonly bookingsAsClient: number;
    readonly bookingsAsCreative: number;
    readonly eoiSubmissions: number;
    readonly businessListings: number;
    readonly creativeProfiles: number;
    readonly creativePortfolioItems: number;
    readonly campaignRooms: number;
    readonly auditLogs: number;
  };
}

function getDisplayName(profile: { readonly displayName: string } | null): string {
  if (profile === null) {
    return "No profile";
  }

  return profile.displayName;
}

export async function getAdminUsers(): Promise<readonly AdminUserListItem[]> {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
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

  return users.map(
    (user): AdminUserListItem => ({
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      displayName: getDisplayName(user.profile),
      publicSlug: user.profile?.publicSlug ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
  );
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
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

  if (user === null) {
    return null;
  }

  const [
    projectsAsClient,
    projectsAsCreative,
    invoices,
    bookingsAsClient,
    bookingsAsCreative,
    eoiSubmissions,
    businessListings,
    creativeProfiles,
    creativePortfolioItems,
    campaignRooms,
    auditLogs
  ] = await Promise.all([
    prisma.project.count({
      where: {
        clientId: user.id
      }
    }),
    prisma.project.count({
      where: {
        creativeId: user.id
      }
    }),
    prisma.invoice.count({
      where: {
        clientId: user.id
      }
    }),
    prisma.booking.count({
      where: {
        clientId: user.id
      }
    }),
    prisma.booking.count({
      where: {
        creativeId: user.id
      }
    }),
    prisma.eoiSubmission.count({
      where: {
        collaboratorId: user.id
      }
    }),
    prisma.businessListing.count({
      where: {
        clientId: user.id
      }
    }),
    prisma.creativeProfilePage.count({
      where: {
        creativeId: user.id
      }
    }),
    prisma.creativePortfolioItem.count({
      where: {
        creativeId: user.id
      }
    }),
    prisma.campaignRoom.count({
      where: {
        collaboratorId: user.id
      }
    }),
    prisma.auditLog.count({
      where: {
        actorId: user.id
      }
    })
  ]);

  return {
    id: user.id,
    email: user.email,
    normalizedEmail: user.normalizedEmail,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: user.profile,
    counts: {
      projectsAsClient,
      projectsAsCreative,
      invoices,
      bookingsAsClient,
      bookingsAsCreative,
      eoiSubmissions,
      businessListings,
      creativeProfiles,
      creativePortfolioItems,
      campaignRooms,
      auditLogs
    }
  };
}
