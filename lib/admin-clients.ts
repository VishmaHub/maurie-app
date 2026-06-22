import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export interface AdminClientListItem {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly displayName: string;
  readonly publicSlug: string | null;
  readonly projectCount: number;
  readonly invoiceCount: number;
  readonly bookingCount: number;
  readonly listingCount: number;
  readonly outstandingAmountCents: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminClientProject {
  readonly id: string;
  readonly projectCode: string;
  readonly title: string;
  readonly summary: string | null;
  readonly status: string;
  readonly startsAt: Date | null;
  readonly endsAt: Date | null;
  readonly creativeId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminClientInvoice {
  readonly id: string;
  readonly invoiceNumber: string;
  readonly amountCents: number;
  readonly gstCents: number;
  readonly currency: string;
  readonly taxStatus: string;
  readonly paymentStatus: string;
  readonly issuedAt: Date | null;
  readonly dueAt: Date | null;
  readonly paidAt: Date | null;
  readonly projectCode: string;
  readonly projectTitle: string;
}

export interface AdminClientBooking {
  readonly id: string;
  readonly creativeId: string;
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

export interface AdminClientBusinessListing {
  readonly id: string;
  readonly businessName: string;
  readonly publicSlug: string;
  readonly headline: string;
  readonly isPublished: boolean;
  readonly offerCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminClientDetail {
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
  readonly projects: readonly AdminClientProject[];
  readonly invoices: readonly AdminClientInvoice[];
  readonly bookings: readonly AdminClientBooking[];
  readonly businessListings: readonly AdminClientBusinessListing[];
}

function getDisplayName(profile: { readonly displayName: string } | null): string {
  if (profile === null) {
    return "Unnamed client";
  }

  return profile.displayName;
}

export async function getAdminClients(): Promise<readonly AdminClientListItem[]> {
  const clients = await prisma.user.findMany({
    where: {
      role: "CLIENT"
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

  const clientIds: string[] = clients.map((client): string => client.id);

  const [projects, invoices, bookings, listings] = await Promise.all([
    prisma.project.findMany({
      where: {
        clientId: {
          in: clientIds
        }
      },
      select: {
        clientId: true
      }
    }),
    prisma.invoice.findMany({
      where: {
        clientId: {
          in: clientIds
        }
      },
      select: {
        clientId: true,
        amountCents: true,
        paymentStatus: true
      }
    }),
    prisma.booking.findMany({
      where: {
        clientId: {
          in: clientIds
        }
      },
      select: {
        clientId: true
      }
    }),
    prisma.businessListing.findMany({
      where: {
        clientId: {
          in: clientIds
        }
      },
      select: {
        clientId: true
      }
    })
  ]);

  return clients.map((client): AdminClientListItem => {
    const clientProjects = projects.filter((project): boolean => project.clientId === client.id);
    const clientInvoices = invoices.filter((invoice): boolean => invoice.clientId === client.id);
    const clientBookings = bookings.filter((booking): boolean => booking.clientId === client.id);
    const clientListings = listings.filter((listing): boolean => listing.clientId === client.id);

    const outstandingAmountCents: number = clientInvoices
      .filter((invoice): boolean => invoice.paymentStatus !== "PAID")
      .reduce((total, invoice): number => total + invoice.amountCents, 0);

    return {
      id: client.id,
      email: client.email,
      role: client.role,
      isActive: client.isActive,
      displayName: getDisplayName(client.profile),
      publicSlug: client.profile?.publicSlug ?? null,
      projectCount: clientProjects.length,
      invoiceCount: clientInvoices.length,
      bookingCount: clientBookings.length,
      listingCount: clientListings.length,
      outstandingAmountCents,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    };
  });
}

export async function getAdminClientDetail(clientId: string): Promise<AdminClientDetail | null> {
  const client = await prisma.user.findFirst({
    where: {
      id: clientId,
      role: "CLIENT"
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

  if (client === null) {
    return null;
  }

  const [projects, invoices, bookings, businessListings] = await Promise.all([
    prisma.project.findMany({
      where: {
        clientId: client.id
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
        startsAt: true,
        endsAt: true,
        creativeId: true,
        createdAt: true,
        updatedAt: true
      }
    }),
    prisma.invoice.findMany({
      where: {
        clientId: client.id
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        invoiceNumber: true,
        amountCents: true,
        gstCents: true,
        currency: true,
        taxStatus: true,
        paymentStatus: true,
        issuedAt: true,
        dueAt: true,
        paidAt: true,
        project: {
          select: {
            projectCode: true,
            title: true
          }
        }
      }
    }),
    prisma.booking.findMany({
      where: {
        clientId: client.id
      },
      orderBy: {
        scheduledTime: "desc"
      },
      select: {
        id: true,
        creativeId: true,
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
    prisma.businessListing.findMany({
      where: {
        clientId: client.id
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        businessName: true,
        publicSlug: true,
        headline: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        offers: {
          select: {
            id: true
          }
        }
      }
    })
  ]);

  return {
    id: client.id,
    email: client.email,
    normalizedEmail: client.normalizedEmail,
    role: client.role,
    isActive: client.isActive,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
    profile: client.profile,
    projects,
    invoices: invoices.map(
      (invoice): AdminClientInvoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amountCents: invoice.amountCents,
        gstCents: invoice.gstCents,
        currency: invoice.currency,
        taxStatus: invoice.taxStatus,
        paymentStatus: invoice.paymentStatus,
        issuedAt: invoice.issuedAt,
        dueAt: invoice.dueAt,
        paidAt: invoice.paidAt,
        projectCode: invoice.project.projectCode,
        projectTitle: invoice.project.title
      })
    ),
    bookings,
    businessListings: businessListings.map(
      (listing): AdminClientBusinessListing => ({
        id: listing.id,
        businessName: listing.businessName,
        publicSlug: listing.publicSlug,
        headline: listing.headline,
        isPublished: listing.isPublished,
        offerCount: listing.offers.length,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt
      })
    )
  };
}
