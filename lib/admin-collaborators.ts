import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export interface AdminCollaboratorListItem {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly displayName: string;
  readonly publicSlug: string | null;
  readonly campaignRoomCount: number;
  readonly campaignAssetCount: number;
  readonly eoiSubmissionCount: number;
  readonly activeCampaignRoomCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminCollaboratorCampaignAsset {
  readonly id: string;
  readonly title: string;
  readonly assetType: string;
  readonly description: string | null;
  readonly resourceUrl: string | null;
  readonly isVisible: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminCollaboratorCampaignRoom {
  readonly id: string;
  readonly campaignCode: string;
  readonly title: string;
  readonly summary: string | null;
  readonly status: string;
  readonly startsAt: Date | null;
  readonly endsAt: Date | null;
  readonly isConfidential: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly assets: readonly AdminCollaboratorCampaignAsset[];
}

export interface AdminCollaboratorEoiSubmission {
  readonly id: string;
  readonly referenceCode: string;
  readonly status: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminCollaboratorDetail {
  readonly id: string;
  readonly email: string;
  readonly normalizedEmail: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly profile: {
    readonly displayName: string;
    readonly publicSlug: string | null;
    readonly bio: string | null;
    readonly isPublic: boolean;
  } | null;
  readonly campaignRooms: readonly AdminCollaboratorCampaignRoom[];
  readonly eoiSubmissions: readonly AdminCollaboratorEoiSubmission[];
}

function getDisplayName(profile: { readonly displayName: string } | null): string {
  if (profile === null) {
    return "Unnamed collaborator";
  }

  return profile.displayName;
}

function getShortEoiReference(id: string): string {
  return `EOI-${id.slice(0, 8).toUpperCase()}`;
}

export async function getAdminCollaborators(): Promise<readonly AdminCollaboratorListItem[]> {
  const collaborators = await prisma.user.findMany({
    where: {
      role: "COLLABORATOR"
    },
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          displayName: true,
          publicSlug: true
        }
      }
    }
  });

  const collaboratorIds: string[] = collaborators.map((collaborator): string => collaborator.id);

  const [campaignRooms, eoiSubmissions] = await Promise.all([
    prisma.campaignRoom.findMany({
      where: {
        collaboratorId: {
          in: collaboratorIds
        }
      },
      select: {
        collaboratorId: true,
        status: true,
        assets: {
          select: {
            id: true
          }
        }
      }
    }),
    prisma.eoiSubmission.findMany({
      where: {
        collaboratorId: {
          in: collaboratorIds
        }
      },
      select: {
        collaboratorId: true
      }
    })
  ]);

  return collaborators.map((collaborator): AdminCollaboratorListItem => {
    const collaboratorCampaignRooms = campaignRooms.filter(
      (campaignRoom): boolean => campaignRoom.collaboratorId === collaborator.id
    );

    const collaboratorEoiSubmissions = eoiSubmissions.filter(
      (eoiSubmission): boolean => eoiSubmission.collaboratorId === collaborator.id
    );

    const campaignAssetCount: number = collaboratorCampaignRooms.reduce(
      (total, campaignRoom): number => total + campaignRoom.assets.length,
      0
    );

    const activeCampaignRoomCount: number = collaboratorCampaignRooms.filter(
      (campaignRoom): boolean => campaignRoom.status === "ACTIVE"
    ).length;

    return {
      id: collaborator.id,
      email: collaborator.email,
      role: collaborator.role,
      isActive: collaborator.isActive,
      displayName: getDisplayName(collaborator.profile),
      publicSlug: collaborator.profile?.publicSlug ?? null,
      campaignRoomCount: collaboratorCampaignRooms.length,
      campaignAssetCount,
      eoiSubmissionCount: collaboratorEoiSubmissions.length,
      activeCampaignRoomCount,
      createdAt: collaborator.createdAt,
      updatedAt: collaborator.updatedAt
    };
  });
}

export async function getAdminCollaboratorDetail(
  collaboratorId: string
): Promise<AdminCollaboratorDetail | null> {
  const collaborator = await prisma.user.findFirst({
    where: {
      id: collaboratorId,
      role: "COLLABORATOR"
    },
    select: {
      id: true,
      email: true,
      normalizedEmail: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          displayName: true,
          publicSlug: true,
          bio: true,
          isPublic: true
        }
      }
    }
  });

  if (collaborator === null) {
    return null;
  }

  const [campaignRooms, eoiSubmissions] = await Promise.all([
    prisma.campaignRoom.findMany({
      where: {
        collaboratorId: collaborator.id
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        campaignCode: true,
        title: true,
        summary: true,
        status: true,
        startsAt: true,
        endsAt: true,
        isConfidential: true,
        createdAt: true,
        updatedAt: true,
        assets: {
          orderBy: {
            createdAt: "desc"
          },
          select: {
            id: true,
            title: true,
            assetType: true,
            description: true,
            resourceUrl: true,
            isVisible: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    }),
    prisma.eoiSubmission.findMany({
      where: {
        collaboratorId: collaborator.id
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true
      }
    })
  ]);

  return {
    id: collaborator.id,
    email: collaborator.email,
    normalizedEmail: collaborator.normalizedEmail,
    role: collaborator.role,
    isActive: collaborator.isActive,
    createdAt: collaborator.createdAt,
    updatedAt: collaborator.updatedAt,
    profile: collaborator.profile,
    campaignRooms,
    eoiSubmissions: eoiSubmissions.map(
      (eoiSubmission): AdminCollaboratorEoiSubmission => ({
        id: eoiSubmission.id,
        referenceCode: getShortEoiReference(eoiSubmission.id),
        status: "SECURELY_STORED",
        createdAt: eoiSubmission.createdAt,
        updatedAt: eoiSubmission.updatedAt
      })
    )
  };
}
