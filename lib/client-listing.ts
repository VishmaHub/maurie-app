import { prisma } from "@/lib/prisma";

export interface ClientListingOffer {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly startsAt: Date | null;
  readonly endsAt: Date | null;
  readonly isActive: boolean;
}

export interface ClientListingDetail {
  readonly id: string;
  readonly publicSlug: string;
  readonly businessName: string;
  readonly headline: string;
  readonly description: string | null;
  readonly websiteUrl: string | null;
  readonly contactEmail: string | null;
  readonly contactPhoneE164: string | null;
  readonly seoTitle: string | null;
  readonly seoDescription: string | null;
  readonly isPublished: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly offers: readonly ClientListingOffer[];
}

export async function getClientListing(userId: string): Promise<ClientListingDetail | null> {
  const listing = await prisma.businessListing.findFirst({
    where: {
      clientId: userId
    },
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      publicSlug: true,
      businessName: true,
      headline: true,
      description: true,
      websiteUrl: true,
      contactEmail: true,
      contactPhoneE164: true,
      seoTitle: true,
      seoDescription: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
      offers: {
        orderBy: {
          createdAt: "desc"
        },
        select: {
          id: true,
          title: true,
          description: true,
          startsAt: true,
          endsAt: true,
          isActive: true
        }
      }
    }
  });

  return listing;
}

export async function getPublishedListingBySlug(
  publicSlug: string
): Promise<ClientListingDetail | null> {
  const listing = await prisma.businessListing.findFirst({
    where: {
      publicSlug,
      isPublished: true
    },
    select: {
      id: true,
      publicSlug: true,
      businessName: true,
      headline: true,
      description: true,
      websiteUrl: true,
      contactEmail: true,
      contactPhoneE164: true,
      seoTitle: true,
      seoDescription: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
      offers: {
        where: {
          isActive: true
        },
        orderBy: {
          createdAt: "desc"
        },
        select: {
          id: true,
          title: true,
          description: true,
          startsAt: true,
          endsAt: true,
          isActive: true
        }
      }
    }
  });

  return listing;
}
