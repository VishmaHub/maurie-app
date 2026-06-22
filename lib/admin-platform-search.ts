import { prisma } from "@/lib/prisma";

export type AdminSearchResultType =
  | "USER"
  | "PROJECT"
  | "INVOICE"
  | "BOOKING"
  | "LISTING"
  | "CREATIVE_PROFILE"
  | "CAMPAIGN_ROOM"
  | "EOI";

export interface AdminSearchResult {
  readonly id: string;
  readonly type: AdminSearchResultType;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly href: string;
  readonly createdAt: Date;
}

export interface AdminPlatformSearchData {
  readonly query: string;
  readonly results: readonly AdminSearchResult[];
}

function normaliseSearchQuery(query: string): string {
  return query.trim().slice(0, 120);
}

function getDisplayName(profile: { readonly displayName: string } | null): string {
  if (profile === null) {
    return "Unnamed profile";
  }

  return profile.displayName;
}

function getShortEoiReference(id: string): string {
  return `EOI-${id.slice(0, 8).toUpperCase()}`;
}

export async function getAdminPlatformSearchData(
  rawQuery: string
): Promise<AdminPlatformSearchData> {
  const query = normaliseSearchQuery(rawQuery);

  if (query.length < 2) {
    return {
      query,
      results: []
    };
  }

  const [
    users,
    projects,
    invoices,
    bookings,
    listings,
    creativeProfiles,
    campaignRooms,
    eoiSubmissions
  ] = await Promise.all([
    prisma.user.findMany({
      take: 10,
      where: {
        OR: [
          {
            email: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            normalizedEmail: {
              contains: query.toLowerCase(),
              mode: "insensitive"
            }
          },
          {
            profile: {
              displayName: {
                contains: query,
                mode: "insensitive"
              }
            }
          },
          {
            profile: {
              publicSlug: {
                contains: query,
                mode: "insensitive"
              }
            }
          }
        ]
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
        profile: {
          select: {
            displayName: true,
            publicSlug: true
          }
        }
      }
    }),
    prisma.project.findMany({
      take: 10,
      where: {
        OR: [
          {
            projectCode: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            title: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            summary: {
              contains: query,
              mode: "insensitive"
            }
          }
        ]
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
        createdAt: true,
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
    prisma.invoice.findMany({
      take: 10,
      where: {
        invoiceNumber: {
          contains: query,
          mode: "insensitive"
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        invoiceNumber: true,
        amountCents: true,
        currency: true,
        paymentStatus: true,
        createdAt: true,
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
        project: {
          select: {
            projectCode: true,
            title: true
          }
        }
      }
    }),
    prisma.booking.findMany({
      take: 10,
      where: {
        OR: [
          {
            clientName: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            clientEmail: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            notes: {
              contains: query,
              mode: "insensitive"
            }
          }
        ]
      },
      orderBy: {
        scheduledTime: "desc"
      },
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        status: true,
        scheduledTime: true,
        createdAt: true
      }
    }),
    prisma.businessListing.findMany({
      take: 10,
      where: {
        OR: [
          {
            businessName: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            publicSlug: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            headline: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            description: {
              contains: query,
              mode: "insensitive"
            }
          }
        ]
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
    prisma.creativeProfilePage.findMany({
      take: 10,
      where: {
        OR: [
          {
            publicHandle: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            headline: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            bio: {
              contains: query,
              mode: "insensitive"
            }
          }
        ]
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        creativeId: true,
        publicHandle: true,
        headline: true,
        isPublished: true,
        createdAt: true,
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
    }),
    prisma.campaignRoom.findMany({
      take: 10,
      where: {
        OR: [
          {
            campaignCode: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            title: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            summary: {
              contains: query,
              mode: "insensitive"
            }
          }
        ]
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        campaignCode: true,
        title: true,
        summary: true,
        status: true,
        createdAt: true,
        collaborator: {
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
    prisma.eoiSubmission.findMany({
      take: 10,
      where: {
        id: {
          contains: query,
          mode: "insensitive"
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        collaboratorId: true,
        createdAt: true,
        collaborator: {
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
    })
  ]);

  const results: AdminSearchResult[] = [
    ...users.map(
      (user): AdminSearchResult => ({
        id: user.id,
        type: "USER",
        title: getDisplayName(user.profile),
        subtitle: `${user.role} · ${user.email}`,
        description: user.isActive ? "Active platform user." : "Inactive platform user.",
        href: `/dashboard/admin/users/${user.id}`,
        createdAt: user.createdAt
      })
    ),
    ...projects.map(
      (project): AdminSearchResult => ({
        id: project.id,
        type: "PROJECT",
        title: project.title,
        subtitle: `${project.projectCode} · ${project.status}`,
        description: `Client: ${getDisplayName(project.client.profile)} · ${project.client.email}`,
        href: `/dashboard/admin/projects/${project.id}`,
        createdAt: project.createdAt
      })
    ),
    ...invoices.map(
      (invoice): AdminSearchResult => ({
        id: invoice.id,
        type: "INVOICE",
        title: invoice.invoiceNumber,
        subtitle: `${invoice.paymentStatus} · ${invoice.currency}`,
        description: `${invoice.project.projectCode} · ${invoice.project.title}`,
        href: `/dashboard/admin/invoices/${invoice.id}`,
        createdAt: invoice.createdAt
      })
    ),
    ...bookings.map(
      (booking): AdminSearchResult => ({
        id: booking.id,
        type: "BOOKING",
        title: `Booking with ${booking.clientName}`,
        subtitle: `${booking.status} · ${booking.clientEmail}`,
        description: `Scheduled for ${booking.scheduledTime.toISOString()}`,
        href: `/dashboard/admin/bookings/${booking.id}`,
        createdAt: booking.createdAt
      })
    ),
    ...listings.map(
      (listing): AdminSearchResult => ({
        id: listing.id,
        type: "LISTING",
        title: listing.businessName,
        subtitle: `/l/${listing.publicSlug}`,
        description: `${listing.isPublished ? "Published" : "Draft"} · ${listing.headline}`,
        href: `/dashboard/admin/listings/${listing.id}`,
        createdAt: listing.createdAt
      })
    ),
    ...creativeProfiles.map(
      (profile): AdminSearchResult => ({
        id: profile.id,
        type: "CREATIVE_PROFILE",
        title: getDisplayName(profile.creative.profile),
        subtitle: `/c/${profile.publicHandle}`,
        description: `${profile.isPublished ? "Published" : "Draft"} · ${profile.headline}`,
        href: `/dashboard/admin/creatives/${profile.creativeId}`,
        createdAt: profile.createdAt
      })
    ),
    ...campaignRooms.map(
      (campaignRoom): AdminSearchResult => ({
        id: campaignRoom.id,
        type: "CAMPAIGN_ROOM",
        title: campaignRoom.title,
        subtitle: `${campaignRoom.campaignCode} · ${campaignRoom.status}`,
        description: `Collaborator: ${getDisplayName(campaignRoom.collaborator.profile)} · ${
          campaignRoom.collaborator.email
        }`,
        href: `/dashboard/admin/campaign-rooms/${campaignRoom.id}`,
        createdAt: campaignRoom.createdAt
      })
    ),
    ...eoiSubmissions.map(
      (submission): AdminSearchResult => ({
        id: submission.id,
        type: "EOI",
        title: getShortEoiReference(submission.id),
        subtitle: "Secure EOI Submission",
        description: `Collaborator: ${getDisplayName(submission.collaborator.profile)} · ${
          submission.collaborator.email
        }`,
        href: `/dashboard/admin/eoi/${submission.id}`,
        createdAt: submission.createdAt
      })
    )
  ].sort((first, second): number => second.createdAt.getTime() - first.createdAt.getTime());

  return {
    query,
    results
  };
}
