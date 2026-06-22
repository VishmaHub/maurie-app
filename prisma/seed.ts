import dotenv from "dotenv";
import { scryptSync, randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  BookingStatus,
  ComplianceStatus,
  PaymentStatus,
  Prisma,
  PrismaClient,
  ProjectStatus,
  TaxStatus,
  UserRole
} from "../generated/prisma/client";

dotenv.config();

interface SeedUserInput {
  readonly email: string;
  readonly displayName: string;
  readonly role: UserRole;
  readonly publicSlug: string;
  readonly password: string;
  readonly bio: string;
}

interface ScryptHashOptions {
  readonly cost: number;
  readonly blockSize: number;
  readonly parallelization: number;
  readonly keyLength: number;
  readonly maxMemoryBytes: number;
}

const scryptOptions: ScryptHashOptions = {
  cost: 131072,
  blockSize: 8,
  parallelization: 1,
  keyLength: 64,
  maxMemoryBytes: 256 * 1024 * 1024
};

function getDatabaseUrl(): string {
  const databaseUrl: string | undefined = process.env.DATABASE_URL;

  if (typeof databaseUrl !== "string" || databaseUrl.length === 0) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return databaseUrl;
}

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}
function getCreativeVCardPayload(
  input: SeedUserInput
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  if (input.role !== UserRole.CREATIVE) {
    return Prisma.DbNull;
  }

  return {
    version: "1.0",
    displayName: input.displayName,
    title: "Creative Partner",
    company: "Mauri-E"
  };
}

function hashPassword(password: string): string {
  const salt: Buffer = randomBytes(32);

  const derivedKey: Buffer = scryptSync(password, salt, scryptOptions.keyLength, {
    N: scryptOptions.cost,
    r: scryptOptions.blockSize,
    p: scryptOptions.parallelization,
    maxmem: scryptOptions.maxMemoryBytes
  });

  const encodedSalt: string = salt.toString("base64url");
  const encodedHash: string = derivedKey.toString("base64url");

  return `scrypt$N=${scryptOptions.cost},r=${scryptOptions.blockSize},p=${scryptOptions.parallelization}$${encodedSalt}$${encodedHash}`;
}

const adapter: PrismaPg = new PrismaPg({
  connectionString: getDatabaseUrl()
});

const prisma: PrismaClient = new PrismaClient({
  adapter
});

const seedUsers: readonly SeedUserInput[] = [
  {
    email: "client@maurie.local",
    displayName: "Mauri-E Client Demo",
    role: UserRole.CLIENT,
    publicSlug: "maurie-client-demo",
    password: "MauriEClient#2026!",
    bio: "Demo client account for project tracking, contracts, invoices, and business listing workflows."
  },
  {
    email: "creative@maurie.local",
    displayName: "Mauri-E Creative Demo",
    role: UserRole.CREATIVE,
    publicSlug: "maurie-creative-demo",
    password: "MauriECreative#2026!",
    bio: "Demo creative account for portfolio, vCard, bookings, time tracking, and collaboration workflows."
  },
  {
    email: "collaborator@maurie.local",
    displayName: "Mauri-E Collaborator Demo",
    role: UserRole.COLLABORATOR,
    publicSlug: "maurie-collaborator-demo",
    password: "MauriECollaborator#2026!",
    bio: "Demo collaborator account for campaign rooms, event sync, and encrypted EOI workflows."
  }
];

async function seedUser(input: SeedUserInput) {
  const normalisedEmail: string = normaliseEmail(input.email);
  const portfolioHeadline: string | null =
    input.role === UserRole.CREATIVE ? "Purpose-led creative profile" : null;
  const portfolioSummary: string | null =
    input.role === UserRole.CREATIVE
      ? "A sample creative profile prepared for Mauri-E portfolio and vCard workflows."
      : null;

  const user = await prisma.user.upsert({
    where: {
      normalizedEmail: normalisedEmail
    },
    update: {
      email: input.email,
      normalizedEmail: normalisedEmail,
      passwordHash: hashPassword(input.password),
      role: input.role,
      isActive: true,
      profile: {
        upsert: {
          create: {
            publicSlug: input.publicSlug,
            displayName: input.displayName,
            bio: input.bio,
            isPublic: true,
            portfolioHeadline,
            portfolioSummary,
            vCardPayload: getCreativeVCardPayload(input)
          },
          update: {
            publicSlug: input.publicSlug,
            displayName: input.displayName,
            bio: input.bio,
            isPublic: true,
            portfolioHeadline,
            portfolioSummary,
            vCardPayload: getCreativeVCardPayload(input)
          }
        }
      }
    },
    create: {
      email: input.email,
      normalizedEmail: normalisedEmail,
      passwordHash: hashPassword(input.password),
      role: input.role,
      isActive: true,
      profile: {
        create: {
          publicSlug: input.publicSlug,
          displayName: input.displayName,
          bio: input.bio,
          isPublic: true,
          portfolioHeadline,
          portfolioSummary,
          vCardPayload: getCreativeVCardPayload(input)
        }
      }
    }
  });

  return user;
}
function getSeedUserByRole(role: UserRole): SeedUserInput {
  const seedUserInput: SeedUserInput | undefined = seedUsers.find(
    (candidate: SeedUserInput): boolean => candidate.role === role
  );

  if (seedUserInput === undefined) {
    throw new Error(`Seed user for role ${role} is missing.`);
  }

  return seedUserInput;
}

async function main(): Promise<void> {
  const clientSeed: SeedUserInput | undefined = seedUsers.find(
    (seedUserInput: SeedUserInput): boolean => seedUserInput.role === UserRole.CLIENT
  );

  const creativeSeed: SeedUserInput | undefined = seedUsers.find(
    (seedUserInput: SeedUserInput): boolean => seedUserInput.role === UserRole.CREATIVE
  );

  const collaboratorSeed: SeedUserInput | undefined = seedUsers.find(
    (seedUserInput: SeedUserInput): boolean => seedUserInput.role === UserRole.COLLABORATOR
  );

  if (clientSeed === undefined) {
    throw new Error("Client seed user is missing.");
  }

  if (creativeSeed === undefined) {
    throw new Error("Creative seed user is missing.");
  }

  if (collaboratorSeed === undefined) {
    throw new Error("Collaborator seed user is missing.");
  }

  const client = await seedUser(getSeedUserByRole(UserRole.CLIENT));
  const creative = await seedUser(getSeedUserByRole(UserRole.CREATIVE));
  const collaborator = await seedUser(getSeedUserByRole(UserRole.COLLABORATOR));

  const project = await prisma.project.upsert({
    where: {
      projectCode: "ME-FOUNDATION-001"
    },
    update: {
      title: "Mauri-E Platform Foundation",
      summary:
        "Initial secure platform foundation covering dashboard shell, project tracking, contracts, financial workflows, and role-based access.",
      status: ProjectStatus.ACTIVE,
      clientId: client.id,
      creativeId: creative.id
    },
    create: {
      projectCode: "ME-FOUNDATION-001",
      title: "Mauri-E Platform Foundation",
      summary:
        "Initial secure platform foundation covering dashboard shell, project tracking, contracts, financial workflows, and role-based access.",
      status: ProjectStatus.ACTIVE,
      clientId: client.id,
      creativeId: creative.id,
      startsAt: new Date("2026-01-15T09:00:00.000Z"),
      endsAt: new Date("2026-04-30T17:00:00.000Z")
    }
  });

  await prisma.projectMilestone.upsert({
    where: {
      projectId_sortOrder: {
        projectId: project.id,
        sortOrder: 1
      }
    },
    update: {
      title: "Application foundation",
      description: "Next.js, Tailwind, strict TypeScript, Prisma, PostgreSQL, and quality gates.",
      completedAt: new Date()
    },
    create: {
      projectId: project.id,
      sortOrder: 1,
      title: "Application foundation",
      description: "Next.js, Tailwind, strict TypeScript, Prisma, PostgreSQL, and quality gates.",
      completedAt: new Date()
    }
  });

  await prisma.projectMilestone.upsert({
    where: {
      projectId_sortOrder: {
        projectId: project.id,
        sortOrder: 2
      }
    },
    update: {
      title: "Authentication and RBAC",
      description:
        "Secure login, HttpOnly sessions, server-side role routing, and protected dashboards.",
      completedAt: null
    },
    create: {
      projectId: project.id,
      sortOrder: 2,
      title: "Authentication and RBAC",
      description:
        "Secure login, HttpOnly sessions, server-side role routing, and protected dashboards."
    }
  });

  await prisma.invoice.upsert({
    where: {
      invoiceNumber: "ME-INV-0001"
    },
    update: {
      projectId: project.id,
      clientId: client.id,
      amountCents: 240000,
      gstCents: 24000,
      currency: "AUD",
      taxStatus: TaxStatus.GST_INCLUSIVE,
      paymentStatus: PaymentStatus.ISSUED,
      issuedAt: new Date("2026-01-20T00:00:00.000Z"),
      dueAt: new Date("2026-02-03T00:00:00.000Z")
    },
    create: {
      projectId: project.id,
      clientId: client.id,
      invoiceNumber: "ME-INV-0001",
      amountCents: 240000,
      gstCents: 24000,
      currency: "AUD",
      taxStatus: TaxStatus.GST_INCLUSIVE,
      paymentStatus: PaymentStatus.ISSUED,
      issuedAt: new Date("2026-01-20T00:00:00.000Z"),
      dueAt: new Date("2026-02-03T00:00:00.000Z")
    }
  });

  await prisma.booking.upsert({
    where: {
      creativeId_scheduledTime: {
        creativeId: creative.id,
        scheduledTime: new Date("2026-02-10T01:00:00.000Z")
      }
    },
    update: {
      clientId: client.id,
      clientName: "Mauri-E Client Demo",
      clientEmail: "client@maurie.local",
      status: BookingStatus.CONFIRMED,
      durationMinutes: 60,
      notes: "Demo booking for creative appointment workflow."
    },
    create: {
      creativeId: creative.id,
      clientId: client.id,
      clientName: "Mauri-E Client Demo",
      clientEmail: "client@maurie.local",
      status: BookingStatus.CONFIRMED,
      scheduledTime: new Date("2026-02-10T01:00:00.000Z"),
      durationMinutes: 60,
      notes: "Demo booking for creative appointment workflow."
    }
  });

  await prisma.eoiSubmission.upsert({
    where: {
      referenceCode: "ME-EOI-0001"
    },
    update: {
      collaboratorId: collaborator.id,
      filmProjectName: "Cinema for Change: Foundation Slate",
      investmentAmountCents: 1000000,
      currency: "AUD",
      complianceStatus: ComplianceStatus.SUBMITTED,
      encryptedPayload: Buffer.from(
        "Local development encrypted-payload placeholder. Replace with real application-level encryption in production.",
        "utf8"
      ),
      encryptionKeyRef: "local-dev-key-ref-v1",
      riskAcknowledgedAt: new Date("2026-02-01T00:00:00.000Z")
    },
    create: {
      referenceCode: "ME-EOI-0001",
      collaboratorId: collaborator.id,
      filmProjectName: "Cinema for Change: Foundation Slate",
      investmentAmountCents: 1000000,
      currency: "AUD",
      complianceStatus: ComplianceStatus.SUBMITTED,
      encryptedPayload: Buffer.from(
        "Local development encrypted-payload placeholder. Replace with real application-level encryption in production.",
        "utf8"
      ),
      encryptionKeyRef: "local-dev-key-ref-v1",
      riskAcknowledgedAt: new Date("2026-02-01T00:00:00.000Z")
    }
  });

  const listing = await prisma.businessListing.upsert({
    where: {
      publicSlug: "maurie-client-demo"
    },
    update: {
      clientId: client.id,
      businessName: "Mauri-E Client Demo",
      headline: "Purpose-led business profile powered by Mauri-E.",
      description:
        "A sample public listing prepared for the Mauri-E Client Listing Hub. This listing demonstrates how clients can present their business details, active offers, and landing-page-ready profile.",
      websiteUrl: "https://mauri-e.com",
      contactEmail: "client@maurie.local",
      contactPhoneE164: "+61400000000",
      seoTitle: "Mauri-E Client Demo Listing",
      seoDescription:
        "A sample Mauri-E business listing for client profile, offers, and public landing page workflows.",
      isPublished: true
    },
    create: {
      clientId: client.id,
      publicSlug: "maurie-client-demo",
      businessName: "Mauri-E Client Demo",
      headline: "Purpose-led business profile powered by Mauri-E.",
      description:
        "A sample public listing prepared for the Mauri-E Client Listing Hub. This listing demonstrates how clients can present their business details, active offers, and landing-page-ready profile.",
      websiteUrl: "https://mauri-e.com",
      contactEmail: "client@maurie.local",
      contactPhoneE164: "+61400000000",
      seoTitle: "Mauri-E Client Demo Listing",
      seoDescription:
        "A sample Mauri-E business listing for client profile, offers, and public landing page workflows.",
      isPublished: true
    }
  });

  await prisma.listingOffer.upsert({
    where: {
      id: "local-demo-listing-offer-001"
    },
    update: {
      businessListingId: listing.id,
      title: "Introductory Brand Visibility Offer",
      description:
        "A sample active offer showing how businesses can promote services, campaigns, or seasonal deals through their Mauri-E listing.",
      startsAt: new Date("2026-02-01T00:00:00.000Z"),
      endsAt: new Date("2026-05-31T23:59:59.000Z"),
      isActive: true
    },
    create: {
      id: "local-demo-listing-offer-001",
      businessListingId: listing.id,
      title: "Introductory Brand Visibility Offer",
      description:
        "A sample active offer showing how businesses can promote services, campaigns, or seasonal deals through their Mauri-E listing.",
      startsAt: new Date("2026-02-01T00:00:00.000Z"),
      endsAt: new Date("2026-05-31T23:59:59.000Z"),
      isActive: true
    }
  });

  //this is the inside main() section

  await prisma.creativeProfilePage.upsert({
    where: {
      publicHandle: "maurie-creative-demo"
    },
    update: {
      creativeId: creative.id,
      headline: "Creative partner for culturally grounded digital storytelling.",
      bio: "A sample Mauri-E creative profile prepared for the creative portfolio and vCard module. This profile demonstrates how creative collaborators can present their work, contact details, and public-facing portfolio.",
      locationLabel: "Sydney, Australia",
      websiteUrl: "https://mauri-e.com",
      contactEmail: "creative@maurie.local",
      isPublished: true
    },
    create: {
      creativeId: creative.id,
      publicHandle: "maurie-creative-demo",
      headline: "Creative partner for culturally grounded digital storytelling.",
      bio: "A sample Mauri-E creative profile prepared for the creative portfolio and vCard module. This profile demonstrates how creative collaborators can present their work, contact details, and public-facing portfolio.",
      locationLabel: "Sydney, Australia",
      websiteUrl: "https://mauri-e.com",
      contactEmail: "creative@maurie.local",
      isPublished: true
    }
  });

  await prisma.creativePortfolioItem.upsert({
    where: {
      id: "local-demo-portfolio-item-001"
    },
    update: {
      creativeId: creative.id,
      title: "Brand Storytelling Campaign",
      category: "Content Production",
      description:
        "A sample portfolio item showing Mauri-E style creative production for brand storytelling, campaign visuals, and digital-first content.",
      mediaUrl: null,
      externalUrl: "https://mauri-e.com",
      sortOrder: 1,
      isPublished: true
    },
    create: {
      id: "local-demo-portfolio-item-001",
      creativeId: creative.id,
      title: "Brand Storytelling Campaign",
      category: "Content Production",
      description:
        "A sample portfolio item showing Mauri-E style creative production for brand storytelling, campaign visuals, and digital-first content.",
      mediaUrl: null,
      externalUrl: "https://mauri-e.com",
      sortOrder: 1,
      isPublished: true
    }
  });

  await prisma.creativePortfolioItem.upsert({
    where: {
      id: "local-demo-portfolio-item-002"
    },
    update: {
      creativeId: creative.id,
      title: "Website Experience Build",
      category: "Web Design",
      description:
        "A sample web portfolio entry prepared for creative partners who deliver digital presence, UX structure, and client-facing website systems.",
      mediaUrl: null,
      externalUrl: "https://mauri-e.com",
      sortOrder: 2,
      isPublished: true
    },
    create: {
      id: "local-demo-portfolio-item-002",
      creativeId: creative.id,
      title: "Website Experience Build",
      category: "Web Design",
      description:
        "A sample web portfolio entry prepared for creative partners who deliver digital presence, UX structure, and client-facing website systems.",
      mediaUrl: null,
      externalUrl: "https://mauri-e.com",
      sortOrder: 2,
      isPublished: true
    }
  });

  const campaignRoom = await prisma.campaignRoom.upsert({
    where: {
      campaignCode: "CAM-ME-2026-001"
    },
    update: {
      collaboratorId: collaborator.id,
      title: "Mauri-E Cultural Storytelling Campaign",
      summary:
        "A sample collaborator campaign room for managing private campaign details, shared assets, collaboration notes, and future-ready EOI or event workflows.",
      status: "ACTIVE",
      startsAt: new Date("2026-03-01T00:00:00.000Z"),
      endsAt: new Date("2026-06-30T23:59:59.000Z"),
      isConfidential: true
    },
    create: {
      collaboratorId: collaborator.id,
      campaignCode: "CAM-ME-2026-001",
      title: "Mauri-E Cultural Storytelling Campaign",
      summary:
        "A sample collaborator campaign room for managing private campaign details, shared assets, collaboration notes, and future-ready EOI or event workflows.",
      status: "ACTIVE",
      startsAt: new Date("2026-03-01T00:00:00.000Z"),
      endsAt: new Date("2026-06-30T23:59:59.000Z"),
      isConfidential: true
    }
  });

  await prisma.campaignRoomAsset.upsert({
    where: {
      id: "local-demo-campaign-asset-001"
    },
    update: {
      campaignRoomId: campaignRoom.id,
      title: "Campaign Brief",
      assetType: "Brief",
      description:
        "A sample campaign brief asset for outlining creative direction, audience, deliverables, and campaign purpose.",
      resourceUrl: null,
      isVisible: true
    },
    create: {
      id: "local-demo-campaign-asset-001",
      campaignRoomId: campaignRoom.id,
      title: "Campaign Brief",
      assetType: "Brief",
      description:
        "A sample campaign brief asset for outlining creative direction, audience, deliverables, and campaign purpose.",
      resourceUrl: null,
      isVisible: true
    }
  });

  await prisma.campaignRoomAsset.upsert({
    where: {
      id: "local-demo-campaign-asset-002"
    },
    update: {
      campaignRoomId: campaignRoom.id,
      title: "Visual Direction Notes",
      assetType: "Creative Notes",
      description:
        "Sample visual direction notes prepared for campaign collaborators, future production planning, and creative alignment.",
      resourceUrl: null,
      isVisible: true
    },
    create: {
      id: "local-demo-campaign-asset-002",
      campaignRoomId: campaignRoom.id,
      title: "Visual Direction Notes",
      assetType: "Creative Notes",
      description:
        "Sample visual direction notes prepared for campaign collaborators, future production planning, and creative alignment.",
      resourceUrl: null,
      isVisible: true
    }
  });

  await prisma.auditLog.deleteMany({
    where: {
      resourceId: "seed-v1"
    }
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: client.id,
        action: "SEED_CLIENT_CREATED",
        resourceType: "Seed",
        resourceId: "seed-v1",
        metadata: {
          email: "client@maurie.local"
        }
      },
      {
        actorId: creative.id,
        action: "SEED_CREATIVE_CREATED",
        resourceType: "Seed",
        resourceId: "seed-v1",
        metadata: {
          email: "creative@maurie.local"
        }
      },
      {
        actorId: collaborator.id,
        action: "SEED_COLLABORATOR_CREATED",
        resourceType: "Seed",
        resourceId: "seed-v1",
        metadata: {
          email: "collaborator@maurie.local"
        }
      }
    ]
  });

  process.stdout.write("Mauri-E seed completed successfully.\n");
  process.stdout.write("Client login: client@maurie.local / MauriEClient#2026!\n");
  process.stdout.write("Creative login: creative@maurie.local / MauriECreative#2026!\n");
  process.stdout.write(
    "Collaborator login: collaborator@maurie.local / MauriECollaborator#2026!\n"
  );
}

main()
  .catch((error: unknown): void => {
    console.error("Mauri-E seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async (): Promise<void> => {
    await prisma.$disconnect();
  });
