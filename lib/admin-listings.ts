import { prisma } from "@/lib/prisma";

export interface AdminListingOffer {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly startsAt: Date | null;
  readonly endsAt: Date | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminListingListItem {
  readonly id: string;
  readonly clientId: string;
  readonly clientName: string;
  readonly clientEmail: string;
  readonly businessName: string;
  readonly publicSlug: string;
  readonly headline: string;
  readonly description: string | null;
  readonly websiteUrl: string | null;
  readonly contactEmail: string | null;
  readonly contactPhoneE164: string | null;
  readonly isPublished: boolean;
  readonly offerCount: number;
  readonly activeOfferCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminListingDetail {
  readonly id: string;
  readonly clientId: string;
  readonly clientName: string;
  readonly clientEmail: string;
  readonly businessName: string;
  readonly publicSlug: string;
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
  readonly offers: readonly AdminListingOffer[];
}

export interface AdminListingClientOption {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly isActive: boolean;
}

function getDisplayName(profile: { readonly displayName: string } | null): string {
  if (profile === null) {
    return "Unnamed client";
  }

  return profile.displayName;
}

export async function getAdminListingClientOptions(): Promise<readonly AdminListingClientOption[]> {
  const clients = await prisma.user.findMany({
    where: {
      role: "CLIENT"
    },
    orderBy: {
      email: "asc"
    },
    select: {
      id: true,
      email: true,
      isActive: true,
      profile: {
        select: {
          displayName: true
        }
      }
    }
  });

  return clients.map(
    (client): AdminListingClientOption => ({
      id: client.id,
      email: client.email,
      displayName: getDisplayName(client.profile),
      isActive: client.isActive
    })
  );
}

export async function getAdminListings(): Promise<readonly AdminListingListItem[]> {
  const listings = await prisma.businessListing.findMany({
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      clientId: true,
      businessName: true,
      publicSlug: true,
      headline: true,
      description: true,
      websiteUrl: true,
      contactEmail: true,
      contactPhoneE164: true,
      isPublished: true,
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
      },
      offers: {
        select: {
          id: true,
          isActive: true
        }
      }
    }
  });

  return listings.map(
    (listing): AdminListingListItem => ({
      id: listing.id,
      clientId: listing.clientId,
      clientName: getDisplayName(listing.client.profile),
      clientEmail: listing.client.email,
      businessName: listing.businessName,
      publicSlug: listing.publicSlug,
      headline: listing.headline,
      description: listing.description,
      websiteUrl: listing.websiteUrl,
      contactEmail: listing.contactEmail,
      contactPhoneE164: listing.contactPhoneE164,
      isPublished: listing.isPublished,
      offerCount: listing.offers.length,
      activeOfferCount: listing.offers.filter((offer): boolean => offer.isActive).length,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt
    })
  );
}

export async function getAdminListingDetail(listingId: string): Promise<AdminListingDetail | null> {
  const listing = await prisma.businessListing.findUnique({
    where: {
      id: listingId
    },
    select: {
      id: true,
      clientId: true,
      businessName: true,
      publicSlug: true,
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
      client: {
        select: {
          email: true,
          profile: {
            select: {
              displayName: true
            }
          }
        }
      },
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
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });

  if (listing === null) {
    return null;
  }

  return {
    id: listing.id,
    clientId: listing.clientId,
    clientName: getDisplayName(listing.client.profile),
    clientEmail: listing.client.email,
    businessName: listing.businessName,
    publicSlug: listing.publicSlug,
    headline: listing.headline,
    description: listing.description,
    websiteUrl: listing.websiteUrl,
    contactEmail: listing.contactEmail,
    contactPhoneE164: listing.contactPhoneE164,
    seoTitle: listing.seoTitle,
    seoDescription: listing.seoDescription,
    isPublished: listing.isPublished,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    offers: listing.offers
  };
}
