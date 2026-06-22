import { prisma } from "@/lib/prisma";

export interface AdminProjectListItem {
  readonly id: string;
  readonly projectCode: string;
  readonly title: string;
  readonly summary: string | null;
  readonly status: string;
  readonly clientName: string;
  readonly clientEmail: string;
  readonly creativeName: string;
  readonly creativeEmail: string;
  readonly milestoneCount: number;
  readonly completedMilestoneCount: number;
  readonly invoiceCount: number;
  readonly invoiceTotalCents: number;
  readonly startsAt: Date | null;
  readonly endsAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminProjectMilestone {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly sortOrder: number;
  readonly completedAt: Date | null;
}

export interface AdminProjectInvoice {
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
}

export interface AdminProjectDetail {
  readonly id: string;
  readonly projectCode: string;
  readonly title: string;
  readonly summary: string | null;
  readonly status: string;
  readonly clientId: string;
  readonly clientName: string;
  readonly clientEmail: string;
  readonly creativeId: string;
  readonly creativeName: string;
  readonly creativeEmail: string;
  readonly startsAt: Date | null;
  readonly endsAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly milestones: readonly AdminProjectMilestone[];
  readonly invoices: readonly AdminProjectInvoice[];
}

function getDisplayName(profile: { readonly displayName: string } | null): string {
  if (profile === null) {
    return "Unnamed profile";
  }

  return profile.displayName;
}

export async function getAdminProjects(): Promise<readonly AdminProjectListItem[]> {
  const projects = await prisma.project.findMany({
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
      creative: {
        select: {
          email: true,
          profile: {
            select: {
              displayName: true
            }
          }
        }
      },
      milestones: {
        select: {
          id: true,
          completedAt: true
        }
      },
      invoices: {
        select: {
          id: true,
          amountCents: true
        }
      }
    }
  });

  return projects.map(
    (project): AdminProjectListItem => ({
      id: project.id,
      projectCode: project.projectCode,
      title: project.title,
      summary: project.summary,
      status: project.status,
      clientName: getDisplayName(project.client.profile),
      clientEmail: project.client.email,
      creativeName: getDisplayName(project.creative.profile),
      creativeEmail: project.creative.email,
      milestoneCount: project.milestones.length,
      completedMilestoneCount: project.milestones.filter(
        (milestone): boolean => milestone.completedAt !== null
      ).length,
      invoiceCount: project.invoices.length,
      invoiceTotalCents: project.invoices.reduce(
        (total, invoice): number => total + invoice.amountCents,
        0
      ),
      startsAt: project.startsAt,
      endsAt: project.endsAt,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    })
  );
}

export async function getAdminProjectDetail(projectId: string): Promise<AdminProjectDetail | null> {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId
    },
    select: {
      id: true,
      projectCode: true,
      title: true,
      summary: true,
      status: true,
      clientId: true,
      creativeId: true,
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
      },
      creative: {
        select: {
          email: true,
          profile: {
            select: {
              displayName: true
            }
          }
        }
      },
      milestones: {
        orderBy: {
          sortOrder: "asc"
        },
        select: {
          id: true,
          title: true,
          description: true,
          sortOrder: true,
          completedAt: true
        }
      },
      invoices: {
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
          paidAt: true
        }
      }
    }
  });

  if (project === null) {
    return null;
  }

  return {
    id: project.id,
    projectCode: project.projectCode,
    title: project.title,
    summary: project.summary,
    status: project.status,
    clientId: project.clientId,
    clientName: getDisplayName(project.client.profile),
    clientEmail: project.client.email,
    creativeId: project.creativeId,
    creativeName: getDisplayName(project.creative.profile),
    creativeEmail: project.creative.email,
    startsAt: project.startsAt,
    endsAt: project.endsAt,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    milestones: project.milestones,
    invoices: project.invoices
  };
}
