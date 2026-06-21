import { prisma } from "@/lib/prisma";

export interface ClientDashboardProject {
  readonly id: string;
  readonly projectCode: string;
  readonly title: string;
  readonly status: string;
  readonly creativeName: string;
  readonly milestoneCount: number;
  readonly invoiceCount: number;
}

export interface ClientDashboardInvoice {
  readonly id: string;
  readonly invoiceNumber: string;
  readonly amountCents: number;
  readonly gstCents: number;
  readonly currency: string;
  readonly paymentStatus: string;
  readonly dueAt: Date | null;
}

export interface ClientDashboardData {
  readonly projects: readonly ClientDashboardProject[];
  readonly invoices: readonly ClientDashboardInvoice[];
}

export interface CreativeDashboardProject {
  readonly id: string;
  readonly projectCode: string;
  readonly title: string;
  readonly status: string;
  readonly clientName: string;
  readonly milestoneCount: number;
}

export interface CreativeDashboardBooking {
  readonly id: string;
  readonly clientName: string;
  readonly clientEmail: string;
  readonly status: string;
  readonly scheduledTime: Date;
  readonly durationMinutes: number;
}

export interface CreativeDashboardData {
  readonly projects: readonly CreativeDashboardProject[];
  readonly bookings: readonly CreativeDashboardBooking[];
}

export interface CollaboratorDashboardEoi {
  readonly id: string;
  readonly referenceCode: string;
  readonly filmProjectName: string;
  readonly investmentAmountCents: number;
  readonly currency: string;
  readonly complianceStatus: string;
  readonly submittedAt: Date;
}

export interface CollaboratorDashboardData {
  readonly eoiSubmissions: readonly CollaboratorDashboardEoi[];
}

function getDisplayNameFromProfile(
  profile: {
    readonly displayName: string;
  } | null
): string {
  if (profile === null) {
    return "Unassigned profile";
  }

  return profile.displayName;
}

export async function getClientDashboardData(userId: string): Promise<ClientDashboardData> {
  const [projects, invoices] = await Promise.all([
    prisma.project.findMany({
      where: {
        clientId: userId
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        projectCode: true,
        title: true,
        status: true,
        creative: {
          select: {
            profile: {
              select: {
                displayName: true
              }
            }
          }
        },
        milestones: {
          select: {
            id: true
          }
        },
        invoices: {
          select: {
            id: true
          }
        }
      }
    }),
    prisma.invoice.findMany({
      where: {
        clientId: userId
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
        paymentStatus: true,
        dueAt: true
      }
    })
  ]);

  return {
    projects: projects.map(
      (project): ClientDashboardProject => ({
        id: project.id,
        projectCode: project.projectCode,
        title: project.title,
        status: project.status,
        creativeName: getDisplayNameFromProfile(project.creative.profile),
        milestoneCount: project.milestones.length,
        invoiceCount: project.invoices.length
      })
    ),
    invoices
  };
}

export async function getCreativeDashboardData(userId: string): Promise<CreativeDashboardData> {
  const [projects, bookings] = await Promise.all([
    prisma.project.findMany({
      where: {
        creativeId: userId
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        projectCode: true,
        title: true,
        status: true,
        client: {
          select: {
            profile: {
              select: {
                displayName: true
              }
            }
          }
        },
        milestones: {
          select: {
            id: true
          }
        }
      }
    }),
    prisma.booking.findMany({
      where: {
        creativeId: userId
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

  return {
    projects: projects.map(
      (project): CreativeDashboardProject => ({
        id: project.id,
        projectCode: project.projectCode,
        title: project.title,
        status: project.status,
        clientName: getDisplayNameFromProfile(project.client.profile),
        milestoneCount: project.milestones.length
      })
    ),
    bookings
  };
}

export async function getCollaboratorDashboardData(
  userId: string
): Promise<CollaboratorDashboardData> {
  const eoiSubmissions = await prisma.eoiSubmission.findMany({
    where: {
      collaboratorId: userId
    },
    orderBy: {
      submittedAt: "desc"
    },
    select: {
      id: true,
      referenceCode: true,
      filmProjectName: true,
      investmentAmountCents: true,
      currency: true,
      complianceStatus: true,
      submittedAt: true
    }
  });

  return {
    eoiSubmissions
  };
}
