import { prisma } from "@/lib/prisma";

/**
 * Platform setting key used to store public register page content.
 *
 * The value is stored as a JSON string in PlatformSetting.value because the
 * existing settings model already supports string-based configurable values.
 */
export const REGISTER_PAGE_CONTENT_SETTING_KEY = "public.register.content";

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

/**
 * Fallback register page content.
 *
 * This protects /register from breaking if the admin setting is missing,
 * empty, or contains invalid JSON.
 */
export const DEFAULT_REGISTER_PAGE_CONTENT: RegisterPageContent = {
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

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => isString(item));
}

function isRegisterPathwayContent(value: unknown): value is RegisterPathwayContent {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    isString(record.title) &&
    isString(record.eyebrow) &&
    isString(record.description) &&
    isString(record.href) &&
    isString(record.label) &&
    isString(record.status) &&
    isStringArray(record.highlights)
  );
}

function isRegisterInfoBlockContent(value: unknown): value is RegisterInfoBlockContent {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return isString(record.title) && isString(record.description);
}

export function isRegisterPageContent(value: unknown): value is RegisterPageContent {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    isString(record.brandTitle) &&
    isString(record.brandSubtitle) &&
    isString(record.badge) &&
    isString(record.heading) &&
    isString(record.description) &&
    isString(record.loginHref) &&
    Array.isArray(record.pathways) &&
    record.pathways.length > 0 &&
    record.pathways.every(isRegisterPathwayContent) &&
    Array.isArray(record.infoBlocks) &&
    record.infoBlocks.length > 0 &&
    record.infoBlocks.every(isRegisterInfoBlockContent)
  );
}

export function parseRegisterPageContent(value: string): RegisterPageContent | null {
  try {
    const parsedValue: unknown = JSON.parse(value);

    if (isRegisterPageContent(parsedValue)) {
      return parsedValue;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Formats register page content for storage in PlatformSetting.value.
 *
 * This keeps admin-edited JSON readable and consistent.
 */
export function formatRegisterPageContentForStorage(content: RegisterPageContent): string {
  return JSON.stringify(content, null, 2);
}


/**
 * Reads registration page content.
 *
 * The content is now admin-controllable through PlatformSetting. If the setting
 * is missing or invalid, the page falls back to safe default content.
 */
export async function getRegisterPageContent(): Promise<RegisterPageContent> {
  const setting = await prisma.platformSetting.findUnique({
    where: {
      key: REGISTER_PAGE_CONTENT_SETTING_KEY
    },
    select: {
      value: true
    }
  });

  if (setting === null) {
    return DEFAULT_REGISTER_PAGE_CONTENT;
  }

  const parsedContent = parseRegisterPageContent(setting.value);

  return parsedContent ?? DEFAULT_REGISTER_PAGE_CONTENT;
}