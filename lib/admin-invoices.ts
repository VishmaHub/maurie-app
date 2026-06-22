import { prisma } from "@/lib/prisma";

export interface AdminInvoiceListItem {
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
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly clientId: string;
  readonly clientName: string;
  readonly clientEmail: string;
  readonly projectId: string;
  readonly projectCode: string;
  readonly projectTitle: string;
}

export interface AdminInvoiceDetail {
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
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly client: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
  };
  readonly project: {
    readonly id: string;
    readonly projectCode: string;
    readonly title: string;
    readonly status: string;
    readonly creativeId: string;
    readonly creativeName: string;
    readonly creativeEmail: string;
  };
}

function getDisplayName(profile: { readonly displayName: string } | null): string {
  if (profile === null) {
    return "Unnamed profile";
  }

  return profile.displayName;
}

export async function getAdminInvoices(): Promise<readonly AdminInvoiceListItem[]> {
  const invoices = await prisma.invoice.findMany({
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
      createdAt: true,
      updatedAt: true,
      clientId: true,
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
          id: true,
          projectCode: true,
          title: true
        }
      }
    }
  });

  return invoices.map(
    (invoice): AdminInvoiceListItem => ({
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
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      clientId: invoice.clientId,
      clientName: getDisplayName(invoice.client.profile),
      clientEmail: invoice.client.email,
      projectId: invoice.project.id,
      projectCode: invoice.project.projectCode,
      projectTitle: invoice.project.title
    })
  );
}

export async function getAdminInvoiceDetail(invoiceId: string): Promise<AdminInvoiceDetail | null> {
  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId
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
      createdAt: true,
      updatedAt: true,
      client: {
        select: {
          id: true,
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
          id: true,
          projectCode: true,
          title: true,
          status: true,
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
      }
    }
  });

  if (invoice === null) {
    return null;
  }

  return {
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
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
    client: {
      id: invoice.client.id,
      name: getDisplayName(invoice.client.profile),
      email: invoice.client.email
    },
    project: {
      id: invoice.project.id,
      projectCode: invoice.project.projectCode,
      title: invoice.project.title,
      status: invoice.project.status,
      creativeId: invoice.project.creativeId,
      creativeName: getDisplayName(invoice.project.creative.profile),
      creativeEmail: invoice.project.creative.email
    }
  };
}
