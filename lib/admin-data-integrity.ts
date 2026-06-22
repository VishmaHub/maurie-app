import { prisma } from "@/lib/prisma";

export type DataIntegritySeverity = "PASS" | "WATCH" | "ACTION";

export interface AdminDataIntegrityCheck {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly description: string;
  readonly severity: DataIntegritySeverity;
  readonly href: string;
}

export interface AdminEmptyStateReviewItem {
  readonly module: string;
  readonly route: string;
  readonly status: string;
  readonly recommendation: string;
}

export interface AdminDataIntegrityData {
  readonly generatedAt: Date;
  readonly summary: {
    readonly totalChecks: number;
    readonly pass: number;
    readonly watch: number;
    readonly action: number;
  };
  readonly checks: readonly AdminDataIntegrityCheck[];
  readonly emptyStateReview: readonly AdminEmptyStateReviewItem[];
}

interface UserForIntegrity {
  readonly id: string;
  readonly normalizedEmail: string;
  readonly isActive: boolean;
  readonly profile: {
    readonly displayName: string;
    readonly publicSlug: string | null;
  } | null;
}

function getSeverity(value: number, actionThreshold = 1): DataIntegritySeverity {
  if (value >= actionThreshold) {
    return "ACTION";
  }

  return "PASS";
}

function getWatchSeverity(value: number): DataIntegritySeverity {
  if (value > 0) {
    return "WATCH";
  }

  return "PASS";
}

function getDuplicateNormalizedEmailCount(users: readonly UserForIntegrity[]): number {
  const emailCounts = new Map<string, number>();

  for (const user of users) {
    const currentCount: number = emailCounts.get(user.normalizedEmail) ?? 0;
    emailCounts.set(user.normalizedEmail, currentCount + 1);
  }

  return Array.from(emailCounts.values()).filter((count): boolean => count > 1).length;
}

export async function getAdminDataIntegrityData(): Promise<AdminDataIntegrityData> {
  const [
    users,
    projects,
    invoices,
    bookings,
    listings,
    creativeProfiles,
    campaignRooms,
    eoiSubmissions,
    auditLogs
  ] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        normalizedEmail: true,
        isActive: true,
        profile: {
          select: {
            displayName: true,
            publicSlug: true
          }
        }
      }
    }),
    prisma.project.findMany({
      select: {
        id: true,
        summary: true,
        startsAt: true,
        endsAt: true
      }
    }),
    prisma.invoice.findMany({
      select: {
        id: true,
        issuedAt: true,
        dueAt: true,
        paidAt: true,
        paymentStatus: true
      }
    }),
    prisma.booking.findMany({
      select: {
        id: true,
        clientId: true,
        clientPhoneE164: true,
        scheduledTime: true
      }
    }),
    prisma.businessListing.findMany({
      select: {
        id: true,
        isPublished: true,
        contactEmail: true,
        contactPhoneE164: true,
        websiteUrl: true,
        seoTitle: true,
        seoDescription: true
      }
    }),
    prisma.creativeProfilePage.findMany({
      select: {
        id: true,
        isPublished: true,
        contactEmail: true,
        websiteUrl: true
      }
    }),
    prisma.campaignRoom.findMany({
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        isConfidential: true,
        assets: {
          select: {
            id: true
          }
        }
      }
    }),
    prisma.eoiSubmission.findMany({
      select: {
        id: true,
        createdAt: true
      }
    }),
    prisma.auditLog.findMany({
      select: {
        id: true,
        actorId: true
      }
    })
  ]);

  const usersWithoutProfiles = users.filter((user): boolean => user.profile === null).length;
  const inactiveUsers = users.filter((user): boolean => !user.isActive).length;
  const duplicateEmailGroups = getDuplicateNormalizedEmailCount(users);

  const projectsWithoutSummary = projects.filter(
    (project): boolean => project.summary === null || project.summary.trim().length === 0
  ).length;

  const projectsWithoutTimeline = projects.filter(
    (project): boolean => project.startsAt === null || project.endsAt === null
  ).length;

  const invoicesWithoutIssuedDate = invoices.filter(
    (invoice): boolean => invoice.issuedAt === null
  ).length;

  const invoicesWithoutDueDate = invoices.filter(
    (invoice): boolean => invoice.dueAt === null
  ).length;

  const outstandingInvoices = invoices.filter(
    (invoice): boolean => invoice.paymentStatus !== "PAID"
  ).length;

  const paidInvoicesWithoutPaidDate = invoices.filter(
    (invoice): boolean => invoice.paymentStatus === "PAID" && invoice.paidAt === null
  ).length;

  const externalBookings = bookings.filter((booking): boolean => booking.clientId === null).length;

  const bookingsWithoutPhone = bookings.filter(
    (booking): boolean => booking.clientPhoneE164 === null
  ).length;

  const publishedListingsMissingContact = listings.filter(
    (listing): boolean =>
      listing.isPublished &&
      listing.contactEmail === null &&
      listing.contactPhoneE164 === null &&
      listing.websiteUrl === null
  ).length;

  const publishedListingsWithSeoGaps = listings.filter(
    (listing): boolean =>
      listing.isPublished && (listing.seoTitle === null || listing.seoDescription === null)
  ).length;

  const draftCreativeProfiles = creativeProfiles.filter(
    (creativeProfile): boolean => !creativeProfile.isPublished
  ).length;

  const publishedCreativeProfilesMissingContact = creativeProfiles.filter(
    (creativeProfile): boolean =>
      creativeProfile.isPublished &&
      creativeProfile.contactEmail === null &&
      creativeProfile.websiteUrl === null
  ).length;

  const campaignRoomsWithoutTimeline = campaignRooms.filter(
    (campaignRoom): boolean => campaignRoom.startsAt === null || campaignRoom.endsAt === null
  ).length;

  const campaignRoomsWithoutAssets = campaignRooms.filter(
    (campaignRoom): boolean => campaignRoom.assets.length === 0
  ).length;

  const confidentialCampaignRooms = campaignRooms.filter(
    (campaignRoom): boolean => campaignRoom.isConfidential
  ).length;

  const auditLogsWithoutActor = auditLogs.filter(
    (auditLog): boolean => auditLog.actorId === null
  ).length;

  const checks: readonly AdminDataIntegrityCheck[] = [
    {
      id: "users-without-profiles",
      label: "Users without profiles",
      value: usersWithoutProfiles,
      description: "Every active platform user should have a linked profile record.",
      severity: getSeverity(usersWithoutProfiles),
      href: "/dashboard/admin/users"
    },
    {
      id: "inactive-users",
      label: "Inactive users",
      value: inactiveUsers,
      description: "Inactive users are acceptable, but should be reviewed regularly.",
      severity: getWatchSeverity(inactiveUsers),
      href: "/dashboard/admin/users"
    },
    {
      id: "duplicate-email-groups",
      label: "Duplicate email groups",
      value: duplicateEmailGroups,
      description: "Normalised email addresses should remain unique across user accounts.",
      severity: getSeverity(duplicateEmailGroups),
      href: "/dashboard/admin/users"
    },
    {
      id: "projects-without-summary",
      label: "Projects without summary",
      value: projectsWithoutSummary,
      description: "Projects should include a short operational summary for admin clarity.",
      severity: getWatchSeverity(projectsWithoutSummary),
      href: "/dashboard/admin/projects"
    },
    {
      id: "projects-without-timeline",
      label: "Projects without timeline",
      value: projectsWithoutTimeline,
      description: "Projects without start or end dates should be reviewed.",
      severity: getWatchSeverity(projectsWithoutTimeline),
      href: "/dashboard/admin/projects"
    },
    {
      id: "invoices-without-issued-date",
      label: "Invoices without issued date",
      value: invoicesWithoutIssuedDate,
      description: "Issued invoices should have a recorded issue date.",
      severity: getSeverity(invoicesWithoutIssuedDate),
      href: "/dashboard/admin/invoices"
    },
    {
      id: "invoices-without-due-date",
      label: "Invoices without due date",
      value: invoicesWithoutDueDate,
      description: "Invoices should have a due date for payment tracking.",
      severity: getWatchSeverity(invoicesWithoutDueDate),
      href: "/dashboard/admin/invoices"
    },
    {
      id: "outstanding-invoices",
      label: "Outstanding invoices",
      value: outstandingInvoices,
      description: "Outstanding invoices should be followed up through the finance workflow.",
      severity: getWatchSeverity(outstandingInvoices),
      href: "/dashboard/admin/invoices"
    },
    {
      id: "paid-invoices-without-paid-date",
      label: "Paid invoices without paid date",
      value: paidInvoicesWithoutPaidDate,
      description: "Paid invoices should include a paid date for financial reporting.",
      severity: getSeverity(paidInvoicesWithoutPaidDate),
      href: "/dashboard/admin/invoices"
    },
    {
      id: "external-bookings",
      label: "External bookings",
      value: externalBookings,
      description: "Bookings without linked client accounts should be reviewed for conversion.",
      severity: getWatchSeverity(externalBookings),
      href: "/dashboard/admin/bookings"
    },
    {
      id: "bookings-without-phone",
      label: "Bookings without phone",
      value: bookingsWithoutPhone,
      description: "Phone numbers are optional, but useful for production and schedule changes.",
      severity: getWatchSeverity(bookingsWithoutPhone),
      href: "/dashboard/admin/bookings"
    },
    {
      id: "published-listings-missing-contact",
      label: "Published listings missing contact",
      value: publishedListingsMissingContact,
      description: "Published listings should include at least one contact method.",
      severity: getSeverity(publishedListingsMissingContact),
      href: "/dashboard/admin/listings"
    },
    {
      id: "published-listings-seo-gaps",
      label: "Published listing SEO gaps",
      value: publishedListingsWithSeoGaps,
      description: "Published listings should include SEO title and description metadata.",
      severity: getWatchSeverity(publishedListingsWithSeoGaps),
      href: "/dashboard/admin/listings"
    },
    {
      id: "draft-creative-profiles",
      label: "Draft creative profiles",
      value: draftCreativeProfiles,
      description: "Draft creative profiles should be reviewed before public launch.",
      severity: getWatchSeverity(draftCreativeProfiles),
      href: "/dashboard/admin/creatives"
    },
    {
      id: "published-creative-profiles-missing-contact",
      label: "Published creative profiles missing contact",
      value: publishedCreativeProfilesMissingContact,
      description: "Published creative pages should include contact or website information.",
      severity: getWatchSeverity(publishedCreativeProfilesMissingContact),
      href: "/dashboard/admin/creatives"
    },
    {
      id: "campaign-rooms-without-timeline",
      label: "Campaign rooms without timeline",
      value: campaignRoomsWithoutTimeline,
      description: "Campaign rooms should include start and end dates where possible.",
      severity: getWatchSeverity(campaignRoomsWithoutTimeline),
      href: "/dashboard/admin/campaign-rooms"
    },
    {
      id: "campaign-rooms-without-assets",
      label: "Campaign rooms without assets",
      value: campaignRoomsWithoutAssets,
      description: "Campaign rooms without assets may still be valid, but should be reviewed.",
      severity: getWatchSeverity(campaignRoomsWithoutAssets),
      href: "/dashboard/admin/campaign-rooms"
    },
    {
      id: "confidential-campaign-rooms",
      label: "Confidential campaign rooms",
      value: confidentialCampaignRooms,
      description:
        "Confidential campaign rooms should be periodically reviewed for access control.",
      severity: getWatchSeverity(confidentialCampaignRooms),
      href: "/dashboard/admin/campaign-rooms"
    },
    {
      id: "eoi-submissions",
      label: "EOI submissions stored",
      value: eoiSubmissions.length,
      description: "EOI payloads remain restricted; this count confirms stored secure submissions.",
      severity: "PASS",
      href: "/dashboard/admin/eoi"
    },
    {
      id: "audit-logs-without-actor",
      label: "Audit logs without actor",
      value: auditLogsWithoutActor,
      description: "System-generated audit logs may not have an actor, but should be reviewed.",
      severity: getWatchSeverity(auditLogsWithoutActor),
      href: "/dashboard/admin/audit-logs"
    }
  ];

  const pass = checks.filter((check): boolean => check.severity === "PASS").length;
  const watch = checks.filter((check): boolean => check.severity === "WATCH").length;
  const action = checks.filter((check): boolean => check.severity === "ACTION").length;

  return {
    generatedAt: new Date(),
    summary: {
      totalChecks: checks.length,
      pass,
      watch,
      action
    },
    checks,
    emptyStateReview: [
      {
        module: "Admin Users",
        route: "/dashboard/admin/users",
        status: "Reviewed",
        recommendation: "Keep empty states simple and direct for user record screens."
      },
      {
        module: "Admin Clients",
        route: "/dashboard/admin/clients",
        status: "Reviewed",
        recommendation: "Show clear next steps when no client records exist."
      },
      {
        module: "Admin Creatives",
        route: "/dashboard/admin/creatives",
        status: "Reviewed",
        recommendation: "Use portfolio and booking language in creative empty states."
      },
      {
        module: "Admin Collaborators",
        route: "/dashboard/admin/collaborators",
        status: "Reviewed",
        recommendation: "Reference campaign rooms and EOI records in collaborator empty states."
      },
      {
        module: "Admin Projects",
        route: "/dashboard/admin/projects",
        status: "Reviewed",
        recommendation: "Project empty states should direct admins to onboarding or client setup."
      },
      {
        module: "Admin Invoices",
        route: "/dashboard/admin/invoices",
        status: "Reviewed",
        recommendation:
          "Invoice empty states should clarify that billing records appear after creation."
      },
      {
        module: "Admin Bookings",
        route: "/dashboard/admin/bookings",
        status: "Reviewed",
        recommendation:
          "Booking empty states should explain that future bookings appear after scheduling."
      },
      {
        module: "Admin Listings",
        route: "/dashboard/admin/listings",
        status: "Reviewed",
        recommendation: "Listing empty states should mention client-owned business listings."
      },
      {
        module: "Admin EOI",
        route: "/dashboard/admin/eoi",
        status: "Reviewed",
        recommendation: "EOI empty states should maintain secure metadata-only language."
      },
      {
        module: "Admin Campaign Rooms",
        route: "/dashboard/admin/campaign-rooms",
        status: "Reviewed",
        recommendation: "Campaign room empty states should reference collaborator campaign setup."
      }
    ]
  };
}
