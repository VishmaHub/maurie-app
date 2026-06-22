import type { UserRole } from "@/types/user-role";

export interface NavigationItem {
  readonly label: string;
  readonly href: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  CLIENT: "Client",
  CREATIVE: "Creative",
  COLLABORATOR: "Collaborator"
};

export const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  ADMIN: "/dashboard/admin",
  CLIENT: "/dashboard/client",
  CREATIVE: "/dashboard/creative",
  COLLABORATOR: "/dashboard/collaborator"
};

export const ROLE_NAVIGATION: Record<UserRole, readonly NavigationItem[]> = {
  ADMIN: [
    {
      label: "Overview",
      href: "/dashboard/admin"
    },
    {
      label: "Users",
      href: "/dashboard/admin/users"
    },
    {
      label: "Clients",
      href: "/dashboard/admin/clients"
    },
    {
      label: "Creatives",
      href: "/dashboard/admin/creatives"
    },
    {
      label: "Collaborators",
      href: "/dashboard/admin/collaborators"
    },
    {
      label: "Listings",
      href: "/dashboard/admin/listings"
    },
    {
      label: "Projects",
      href: "/dashboard/admin/projects"
    },
    {
      label: "Invoices",
      href: "/dashboard/admin/invoices"
    },
    {
      label: "Audit Logs",
      href: "/dashboard/admin/audit-logs"
    }
  ],
  CLIENT: [
    {
      label: "Overview",
      href: "/dashboard/client"
    },
    {
      label: "Projects",
      href: "/dashboard/client/projects"
    },
    {
      label: "Financials",
      href: "/dashboard/client/financials"
    },
    {
      label: "Listing",
      href: "/dashboard/client/listing"
    }
  ],
  CREATIVE: [
    {
      label: "Overview",
      href: "/dashboard/creative"
    },
    {
      label: "Portfolio",
      href: "/dashboard/creative/portfolio"
    },
    {
      label: "Bookings",
      href: "/dashboard/creative/bookings"
    }
  ],
  COLLABORATOR: [
    {
      label: "Overview",
      href: "/dashboard/collaborator"
    },
    {
      label: "Campaigns",
      href: "/dashboard/collaborator/campaigns"
    },
    {
      label: "EOI",
      href: "/dashboard/collaborator/eoi"
    }
  ]
};

export function getVisibleNavigation(role: UserRole): readonly NavigationItem[] {
  return ROLE_NAVIGATION[role];
}
