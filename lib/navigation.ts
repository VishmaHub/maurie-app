import type { UserRole } from "@/types/user-role";

export interface NavigationItem {
  readonly label: string;
  readonly href: string;
  readonly description: string;
  readonly allowedRoles: readonly UserRole[];
}

export const ROLE_LABELS: Record<UserRole, string> = {
  CLIENT: "Client Workspace",
  CREATIVE: "Creative Studio",
  COLLABORATOR: "Collaborator Suite"
};

export const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  CLIENT: "/dashboard/client",
  CREATIVE: "/dashboard/creative",
  COLLABORATOR: "/dashboard/collaborator"
};

export const ROLE_NAVIGATION: Record<UserRole, readonly NavigationItem[]> = {
  CLIENT: [
    {
      label: "Projects",
      href: "/dashboard/client/projects",
      description: "Track briefs, milestones, contracts, and delivery status.",
      allowedRoles: ["CLIENT"]
    },
    {
      label: "Financials",
      href: "/dashboard/client/financials",
      description: "View invoices, GST status, payments, and billing records.",
      allowedRoles: ["CLIENT"]
    },
    {
      label: "Marketing Hub",
      href: "/dashboard/client/marketing",
      description: "Manage website updates, SEO tasks, and content scheduling.",
      allowedRoles: ["CLIENT"]
    },
    {
      label: "Listing Hub",
      href: "/dashboard/client/listing",
      description: "Maintain business details, active offers, and landing pages.",
      allowedRoles: ["CLIENT"]
    }
  ],
  CREATIVE: [
    {
      label: "Portfolio",
      href: "/dashboard/creative/portfolio",
      description: "Manage creative work, proof, and public profile assets.",
      allowedRoles: ["CREATIVE"]
    },
    {
      label: "vCard",
      href: "/dashboard/creative/vcard",
      description: "Build a shareable profile and Apple Wallet-ready identity layer.",
      allowedRoles: ["CREATIVE"]
    },
    {
      label: "Bookings",
      href: "/dashboard/creative/bookings",
      description: "Manage appointments, availability, and client requests.",
      allowedRoles: ["CREATIVE"]
    },
    {
      label: "Time Tracker",
      href: "/dashboard/creative/time-tracker",
      description: "Log immutable work sessions for transparent billing.",
      allowedRoles: ["CREATIVE"]
    }
  ],
  COLLABORATOR: [
    {
      label: "Campaign Rooms",
      href: "/dashboard/collaborator/campaigns",
      description: "Coordinate partner campaigns, activations, and event delivery.",
      allowedRoles: ["COLLABORATOR"]
    },
    {
      label: "Event Sync",
      href: "/dashboard/collaborator/events",
      description: "Align deadlines, partners, production notes, and shared rooms.",
      allowedRoles: ["COLLABORATOR"]
    },
    {
      label: "Film Investment",
      href: "/dashboard/collaborator/eoi",
      description: "Submit and review secure film investment expressions of interest.",
      allowedRoles: ["COLLABORATOR"]
    }
  ]
};
