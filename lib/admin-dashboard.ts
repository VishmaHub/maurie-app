import { prisma } from "@/lib/prisma";

export interface AdminRecentProject {
  readonly id: string;
  readonly projectCode: string;
  readonly title: string;
  readonly status: string;
  readonly clientName: string;
  readonly createdAt: Date;
}

export interface AdminRecentInvoice {
  readonly id: string;
  readonly invoiceNumber: string;
  readonly amountCents: number;
  readonly gstCents: number;
  readonly currency: string;
  readonly paymentStatus: string;
  readonly clientName: string;
  readonly createdAt: Date;
}

export interface AdminUpcomingBooking {
  readonly id: string;
  readonly clientName: string;
  readonly clientEmail: string;
  readonly status: string;
  readonly scheduledTime: Date;
  readonly durationMinutes: number;
}

export interface AdminRecentAuditLog {
  readonly id: string;
  readonly actorId: string | null;
  readonly action: string;
  readonly resourceType: string | null;
  readonly resourceId: string | null;
  readonly timestamp: Date;
}

export interface AdminDashboardData {
  readonly users: {
    readonly total: number;
    readonly active: number;
    readonly admins: number;
    readonly clients: number;
    readonly creatives: number;
    readonly collaborators: number;
  };
  readonly projects: {
    readonly total: number;
    readonly active: number;
    readonly completed: number;
    readonly review: number;
  };
  readonly invoices: {
    readonly total: number;
    readonly paid: number;
    readonly outstanding: number;
    readonly totalAmountCents: number;
    readonly outstandingAmountCents: number;
    readonly gstAmountCents: number;
  };
  readonly bookings: {
    readonly total: number;
    readonly upcoming: number;
    readonly completed: number;
    readonly cancelled: number;
  };
  readonly listings: {
    readonly total: number;
    readonly published: number;
    readonly drafts: number;
  };
  readonly campaignRooms: {
    readonly total: number;
    readonly active: number;
    readonly confidential: number;
  };
  readonly eoi: {
    readonly total: number;
  };
  readonly auditLogs: {
    readonly total: number;
    readonly recent: readonly AdminRecentAuditLog[];
  };
  readonly recentProjects: readonly AdminRecentProject[];
  readonly recentInvoices: readonly AdminRecentInvoice[];
  readonly upcomingBookings: readonly AdminUpcomingBooking[];
}

function getDisplayName(profile: { readonly displayName: string } | null): string {
  if (profile === null) {
    return "Unnamed profile";
  }

  return profile.displayName;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const now = new Date();

  const [
    totalUsers,
    activeUsers,
    adminUsers,
    clientUsers,
    creativeUsers,
    collaboratorUsers,
    totalProjects,
    activeProjects,
    completedProjects,
    invoiceRows,
    totalBookings,
    upcomingBookingsCount,
    completedBookings,
    cancelledBookings,
    totalListings,
    publishedListings,
    totalCampaignRooms,
    activeCampaignRooms,
    confidentialCampaignRooms,
    totalEoi,
    totalAuditLogs,
    recentAuditLogs,
    recentProjectRows,
    recentInvoiceRows,
    upcomingBookingRows
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        isActive: true
      }
    }),
    prisma.user.count({
      where: {
        role: "ADMIN"
      }
    }),
    prisma.user.count({
      where: {
        role: "CLIENT"
      }
    }),
    prisma.user.count({
      where: {
        role: "CREATIVE"
      }
    }),
    prisma.user.count({
      where: {
        role: "COLLABORATOR"
      }
    }),
    prisma.project.count(),
    prisma.project.count({
      where: {
        status: "ACTIVE"
      }
    }),
    prisma.project.count({
      where: {
        status: "COMPLETED"
      }
    }),
    prisma.invoice.findMany({
      select: {
        amountCents: true,
        gstCents: true,
        paymentStatus: true
      }
    }),
    prisma.booking.count(),
    prisma.booking.count({
      where: {
        scheduledTime: {
          gte: now
        }
      }
    }),
    prisma.booking.count({
      where: {
        status: "COMPLETED"
      }
    }),
    prisma.booking.count({
      where: {
        status: "CANCELLED"
      }
    }),
    prisma.businessListing.count(),
    prisma.businessListing.count({
      where: {
        isPublished: true
      }
    }),
    prisma.campaignRoom.count(),
    prisma.campaignRoom.count({
      where: {
        status: "ACTIVE"
      }
    }),
    prisma.campaignRoom.count({
      where: {
        isConfidential: true
      }
    }),
    prisma.eoiSubmission.count(),
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      take: 6,
      orderBy: {
        timestamp: "desc"
      },
      select: {
        id: true,
        actorId: true,
        action: true,
        resourceType: true,
        resourceId: true,
        timestamp: true
      }
    }),
    prisma.project.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        projectCode: true,
        title: true,
        status: true,
        createdAt: true,
        client: {
          select: {
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
      take: 5,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        invoiceNumber: true,
        amountCents: true,
        gstCents: true,
        currency: true,
        paymentStatus: true,
        createdAt: true,
        client: {
          select: {
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
      take: 5,
      where: {
        scheduledTime: {
          gte: now
        }
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
        durationMinutes: true
      }
    })
  ]);

  const paidInvoices = invoiceRows.filter((invoice): boolean => invoice.paymentStatus === "PAID");

  const outstandingInvoices = invoiceRows.filter(
    (invoice): boolean => invoice.paymentStatus !== "PAID"
  );

  const totalAmountCents = invoiceRows.reduce(
    (total, invoice): number => total + invoice.amountCents,
    0
  );

  const outstandingAmountCents = outstandingInvoices.reduce(
    (total, invoice): number => total + invoice.amountCents,
    0
  );

  const gstAmountCents = invoiceRows.reduce(
    (total, invoice): number => total + invoice.gstCents,
    0
  );

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      admins: adminUsers,
      clients: clientUsers,
      creatives: creativeUsers,
      collaborators: collaboratorUsers
    },
    projects: {
      total: totalProjects,
      active: activeProjects,
      completed: completedProjects,
      review: 0
    },
    invoices: {
      total: invoiceRows.length,
      paid: paidInvoices.length,
      outstanding: outstandingInvoices.length,
      totalAmountCents,
      outstandingAmountCents,
      gstAmountCents
    },
    bookings: {
      total: totalBookings,
      upcoming: upcomingBookingsCount,
      completed: completedBookings,
      cancelled: cancelledBookings
    },
    listings: {
      total: totalListings,
      published: publishedListings,
      drafts: totalListings - publishedListings
    },
    campaignRooms: {
      total: totalCampaignRooms,
      active: activeCampaignRooms,
      confidential: confidentialCampaignRooms
    },
    eoi: {
      total: totalEoi
    },
    auditLogs: {
      total: totalAuditLogs,
      recent: recentAuditLogs
    },
    recentProjects: recentProjectRows.map(
      (project): AdminRecentProject => ({
        id: project.id,
        projectCode: project.projectCode,
        title: project.title,
        status: project.status,
        clientName: getDisplayName(project.client.profile),
        createdAt: project.createdAt
      })
    ),
    recentInvoices: recentInvoiceRows.map(
      (invoice): AdminRecentInvoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amountCents: invoice.amountCents,
        gstCents: invoice.gstCents,
        currency: invoice.currency,
        paymentStatus: invoice.paymentStatus,
        clientName: getDisplayName(invoice.client.profile),
        createdAt: invoice.createdAt
      })
    ),
    upcomingBookings: upcomingBookingRows
  };
}
