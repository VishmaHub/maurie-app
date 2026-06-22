import { prisma } from "@/lib/prisma";

export interface AdminDashboardData {
  readonly totalUsers: number;
  readonly activeUsers: number;
  readonly clients: number;
  readonly creatives: number;
  readonly collaborators: number;
  readonly admins: number;
  readonly projects: number;
  readonly invoices: number;
  readonly bookings: number;
  readonly eoiSubmissions: number;
  readonly campaignRooms: number;
  readonly businessListings: number;
  readonly creativeProfiles: number;
  readonly auditLogs: number;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [
    totalUsers,
    activeUsers,
    clients,
    creatives,
    collaborators,
    admins,
    projects,
    invoices,
    bookings,
    eoiSubmissions,
    campaignRooms,
    businessListings,
    creativeProfiles,
    auditLogs
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        isActive: true
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
    prisma.user.count({
      where: {
        role: "ADMIN"
      }
    }),
    prisma.project.count(),
    prisma.invoice.count(),
    prisma.booking.count(),
    prisma.eoiSubmission.count(),
    prisma.campaignRoom.count(),
    prisma.businessListing.count(),
    prisma.creativeProfilePage.count(),
    prisma.auditLog.count()
  ]);

  return {
    totalUsers,
    activeUsers,
    clients,
    creatives,
    collaborators,
    admins,
    projects,
    invoices,
    bookings,
    eoiSubmissions,
    campaignRooms,
    businessListings,
    creativeProfiles,
    auditLogs
  };
}
