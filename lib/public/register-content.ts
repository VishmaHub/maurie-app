/**
 * Register page content provider.
 *
 * This file keeps the public registration page content out of the route component.
 * For the MVP, this is a local content source. In the next admin-content phase,
 * this function can be changed to read from Prisma without rewriting the page UI.
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
  badge: "Choose your pathway",
  heading: "Join the Mauri-E platform.",
  description:
    "Start as a creator, business, or collaborator. Each pathway creates the right account, dashboard, and draft workspace for your role.",
  loginHref: "/login",
  pathways: [
    {
      title: "Creator",
      eyebrow: "Profiles / vCards / Bookings",
      description:
        "Create a public creative identity for your work, portfolio, digital vCard, and future booking opportunities.",
      href: "/register/creator",
      label: "Available",
      status: "Your profile starts as a private draft.",
      highlights: [
        "Create your creator account",
        "Prepare your public profile and vCard",
        "Showcase work before publishing"
      ]
    },
    {
      title: "Business",
      eyebrow: "Listings / Services / Directory",
      description:
        "Register your business, prepare a public listing, and access Mauri-E services through your client dashboard.",
      href: "/register/business",
      label: "Available",
      status: "Your business listing starts unpublished.",
      highlights: [
        "Create your business account",
        "Prepare a public listing",
        "Request digital, creative, and support services"
      ]
    },
    {
      title: "Collaborator",
      eyebrow: "Campaigns / Community / Partnerships",
      description:
        "Apply as a non-profit, community group, or partner organisation for future non-binding campaign collaboration.",
      href: "/register/collaborator",
      label: "Review Required",
      status: "Your application starts as pending approval.",
      highlights: [
        "Create a collaborator account",
        "Submit a partnership application",
        "Campaign access unlocks after approval"
      ]
    }
  ],
  infoBlocks: [
    {
      title: "Private by default",
      description:
        "Creator profiles and business listings start as drafts until they are ready to be published."
    },
    {
      title: "Approval-aware",
      description:
        "Collaborator campaign access remains restricted while applications are pending review."
    },
    {
      title: "Built safely",
      description:
        "This MVP does not process investments, financial products, or subscription payments yet."
    }
  ]
};

/**
 * Reads registration page content.
 *
 * This is intentionally async so the page API will not change when the content
 * later moves to an admin-controlled database table.
 */
export async function getRegisterPageContent(): Promise<RegisterPageContent> {
  return registerPageContent;
}