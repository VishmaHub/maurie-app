import { prisma } from "@/lib/prisma";

export interface ClientInvoiceListItem {
  readonly id: string;
  readonly invoiceNumber: string;
  readonly projectCode: string;
  readonly projectTitle: string;
  readonly amountCents: number;
  readonly gstCents: number;
  readonly currency: string;
  readonly taxStatus: string;
  readonly paymentStatus: string;
  readonly issuedAt: Date | null;
  readonly dueAt: Date | null;
  readonly paidAt: Date | null;
  readonly createdAt: Date;
}

export interface ClientInvoiceDetail {
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
  readonly project: {
    readonly id: string;
    readonly projectCode: string;
    readonly title: string;
    readonly status: string;
    readonly creativeName: string;
  };
}

function getDisplayNameFromProfile(profile: { readonly displayName: string } | null): string {
  if (profile === null) {
    return "Unassigned profile";
  }

  return profile.displayName;
}

export async function getClientInvoices(userId: string): Promise<readonly ClientInvoiceListItem[]> {
  const invoices = await prisma.invoice.findMany({
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
      taxStatus: true,
      paymentStatus: true,
      issuedAt: true,
      dueAt: true,
      paidAt: true,
      createdAt: true,
      project: {
        select: {
          projectCode: true,
          title: true
        }
      }
    }
  });

  return invoices.map(
    (invoice): ClientInvoiceListItem => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      projectCode: invoice.project.projectCode,
      projectTitle: invoice.project.title,
      amountCents: invoice.amountCents,
      gstCents: invoice.gstCents,
      currency: invoice.currency,
      taxStatus: invoice.taxStatus,
      paymentStatus: invoice.paymentStatus,
      issuedAt: invoice.issuedAt,
      dueAt: invoice.dueAt,
      paidAt: invoice.paidAt,
      createdAt: invoice.createdAt
    })
  );
}

export async function getClientInvoiceDetail(input: {
  readonly userId: string;
  readonly invoiceId: string;
}): Promise<ClientInvoiceDetail | null> {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: input.invoiceId,
      clientId: input.userId
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
      project: {
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
    project: {
      id: invoice.project.id,
      projectCode: invoice.project.projectCode,
      title: invoice.project.title,
      status: invoice.project.status,
      creativeName: getDisplayNameFromProfile(invoice.project.creative.profile)
    }
  };
}
