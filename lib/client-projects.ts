import { prisma } from "@/lib/prisma";

export interface ClientProjectListItem {
  readonly id: string;
  readonly projectCode: string;
  readonly title: string;
  readonly summary: string | null;
  readonly status: string;
  readonly creativeName: string;
  readonly milestoneCount: number;
  readonly completedMilestoneCount: number;
  readonly invoiceCount: number;
  readonly createdAt: Date;
}

export interface ClientProjectMilestone {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly sortOrder: number;
  readonly completedAt: Date | null;
}

export interface ClientProjectInvoice {
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

export interface ClientProjectDetail {
  readonly id: string;
  readonly projectCode: string;
  readonly title: string;
  readonly summary: string | null;
  readonly status: string;
  readonly creativeName: string;
  readonly startsAt: Date | null;
  readonly endsAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly milestones: readonly ClientProjectMilestone[];
  readonly invoices: readonly ClientProjectInvoice[];
}

function getDisplayNameFromProfile(profile: { readonly displayName: string } | null): string {
  if (profile === null) {
    return "Unassigned profile";
  }

  return profile.displayName;
}

export async function getClientProjects(userId: string): Promise<readonly ClientProjectListItem[]> {
  const projects = await prisma.project.findMany({
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
      summary: true,
      status: true,
      createdAt: true,
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
          id: true,
          completedAt: true
        }
      },
      invoices: {
        select: {
          id: true
        }
      }
    }
  });

  return projects.map(
    (project): ClientProjectListItem => ({
      id: project.id,
      projectCode: project.projectCode,
      title: project.title,
      summary: project.summary,
      status: project.status,
      creativeName: getDisplayNameFromProfile(project.creative.profile),
      milestoneCount: project.milestones.length,
      completedMilestoneCount: project.milestones.filter(
        (milestone): boolean => milestone.completedAt !== null
      ).length,
      invoiceCount: project.invoices.length,
      createdAt: project.createdAt
    })
  );
}

export async function getClientProjectDetail(input: {
  readonly userId: string;
  readonly projectId: string;
}): Promise<ClientProjectDetail | null> {
  const project = await prisma.project.findFirst({
    where: {
      id: input.projectId,
      clientId: input.userId
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
    creativeName: getDisplayNameFromProfile(project.creative.profile),
    startsAt: project.startsAt,
    endsAt: project.endsAt,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    milestones: project.milestones,
    invoices: project.invoices
  };
}
