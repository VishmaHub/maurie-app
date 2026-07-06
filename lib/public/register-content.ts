/**
 * Register page content provider.
 *
 * This keeps public registration copy separate from the page layout.
 * For now, this file is the content source. Later, this can be replaced by
 * Prisma-backed admin content without changing the UI components.
 */

export interface RegisterPathwayContent {
  readonly title: string;
  readonly eyebrow: string;
  readonly description: string;
  readonly href: string;
  readonly label: string;
  readonly status: string;
  readonly highlights: readonly string[];
}

export interface RegisterInfoBlockContent {
  readonly title: string;
  readonly description: string;
}

export interface RegisterPageContent {
  readonly brandTitle: string;
  readonly brandSubtitle: string;
  readonly badge: string;
  readonly heading: string;
  readonly description: string;
  readonly loginHref: string;
  readonly pathways: readonly RegisterPathwayContent[];
  readonly infoBlocks: readonly RegisterInfoBlockContent[];
}

const registerPageContent: RegisterPageContent = {
  brandTitle: "Mauri-E",
  brandSubtitle: "Public Platform Beta",
  badge: "Choose your account type",
  heading: "Start with the right pathway.",
  description:
    "Join Mauri-E as a creator, business, or collaborator. Each pathway creates the right dashboard, draft workspace, and access level for your role.",
  loginHref: "/login",
  pathways: [
    {
      title: "Creator",
      eyebrow: "Profiles · vCards · Bookings",
      description:
        "Build a public creative profile, prepare your digital vCard, and showcase your work before publishing.",
      href: "/register/creator",
      label: "Available",
      status: "Profile starts as a private draft.",
      highlights: ["Creator dashboard", "Draft public profile", "vCard-ready account"]
    },
    {
      title: "Business",
      eyebrow: "Listings · Services · Directory",
      description:
        "Register your business, prepare a public listing, and manage Mauri-E service requests from your client dashboard.",
      href: "/register/business",
      label: "Available",
      status: "Business listing starts unpublished.",
      highlights: ["Client dashboard", "Draft business listing", "Service request access"]
    },
    {
      title: "Collaborator",
      eyebrow: "Campaigns · Community · Partnerships",
      description:
        "Apply as a non-profit, community group, or partner organisation for future campaign collaboration.",
      href: "/register/collaborator",
      label: "Review",
      status: "Application starts as pending approval.",
      highlights: ["Collaborator dashboard", "Partnership application", "Approval-gated campaigns"]
    }
  ],
  infoBlocks: [
    {
      title: "Draft-first",
      description: "Profiles and listings stay private until they are ready to publish."
    },
    {
      title: "Approval-aware",
      description: "Collaborator campaign access stays restricted until Mauri-E review."
    },
    {
      title: "MVP-safe",
      description: "No investment payments, financial products, or subscription billing yet."
    }
  ]
};

/**
 * Reads registration page content.
 *
 * Kept async so this can later read from an admin-controlled database table
 * without changing the route component contract.
 */
export async function getRegisterPageContent(): Promise<RegisterPageContent> {
  return registerPageContent;
}