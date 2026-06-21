import { prisma } from "@/lib/prisma";

export interface CreativePortfolioItem {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly description: string | null;
  readonly mediaUrl: string | null;
  readonly externalUrl: string | null;
  readonly sortOrder: number;
  readonly isPublished: boolean;
}

export interface CreativePortfolioProfile {
  readonly id: string;
  readonly publicHandle: string;
  readonly creativeName: string;
  readonly creativeEmail: string;
  readonly headline: string;
  readonly bio: string | null;
  readonly locationLabel: string | null;
  readonly websiteUrl: string | null;
  readonly contactEmail: string | null;
  readonly isPublished: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly items: readonly CreativePortfolioItem[];
}

function getDisplayNameFromProfile(profile: { readonly displayName: string } | null): string {
  if (profile === null) {
    return "Mauri-E Creative";
  }

  return profile.displayName;
}

export async function getCreativePortfolioHub(
  userId: string
): Promise<CreativePortfolioProfile | null> {
  const profilePage = await prisma.creativeProfilePage.findUnique({
    where: {
      creativeId: userId
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
      updatedAt: true,
      creative: {
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
  });

  if (profilePage === null) {
    return null;
  }

  const items = await prisma.creativePortfolioItem.findMany({
    where: {
      creativeId: userId
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      category: true,
      description: true,
      mediaUrl: true,
      externalUrl: true,
      sortOrder: true,
      isPublished: true
    }
  });

  return {
    id: profilePage.id,
    publicHandle: profilePage.publicHandle,
    creativeName: getDisplayNameFromProfile(profilePage.creative.profile),
    creativeEmail: profilePage.creative.email,
    headline: profilePage.headline,
    bio: profilePage.bio,
    locationLabel: profilePage.locationLabel,
    websiteUrl: profilePage.websiteUrl,
    contactEmail: profilePage.contactEmail,
    isPublished: profilePage.isPublished,
    createdAt: profilePage.createdAt,
    updatedAt: profilePage.updatedAt,
    items
  };
}

export async function getPublishedCreativeProfileByHandle(
  publicHandle: string
): Promise<CreativePortfolioProfile | null> {
  const profilePage = await prisma.creativeProfilePage.findFirst({
    where: {
      publicHandle,
      isPublished: true
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
      updatedAt: true,
      creativeId: true,
      creative: {
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
  });

  if (profilePage === null) {
    return null;
  }

  const items = await prisma.creativePortfolioItem.findMany({
    where: {
      creativeId: profilePage.creativeId,
      isPublished: true
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      category: true,
      description: true,
      mediaUrl: true,
      externalUrl: true,
      sortOrder: true,
      isPublished: true
    }
  });

  return {
    id: profilePage.id,
    publicHandle: profilePage.publicHandle,
    creativeName: getDisplayNameFromProfile(profilePage.creative.profile),
    creativeEmail: profilePage.creative.email,
    headline: profilePage.headline,
    bio: profilePage.bio,
    locationLabel: profilePage.locationLabel,
    websiteUrl: profilePage.websiteUrl,
    contactEmail: profilePage.contactEmail,
    isPublished: profilePage.isPublished,
    createdAt: profilePage.createdAt,
    updatedAt: profilePage.updatedAt,
    items
  };
}
