import { prisma } from "@/lib/prisma";

export interface AdminCampaignRoomAsset {
  readonly id: string;
  readonly title: string;
  readonly assetType: string;
  readonly description: string | null;
  readonly resourceUrl: string | null;
  readonly isVisible: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminCampaignRoomListItem {
  readonly id: string;
  readonly collaboratorId: string;
  readonly collaboratorName: string;
  readonly collaboratorEmail: string;
  readonly campaignCode: string;
  readonly title: string;
  readonly summary: string | null;
  readonly status: string;
  readonly startsAt: Date | null;
  readonly endsAt: Date | null;
  readonly isConfidential: boolean;
  readonly assetCount: number;
  readonly visibleAssetCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminCampaignRoomDetail {
  readonly id: string;
  readonly collaboratorId: string;
  readonly collaboratorName: string;
  readonly collaboratorEmail: string;
  readonly campaignCode: string;
  readonly title: string;
  readonly summary: string | null;
  readonly status: string;
  readonly startsAt: Date | null;
  readonly endsAt: Date | null;
  readonly isConfidential: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly assets: readonly AdminCampaignRoomAsset[];
}

function getDisplayName(profile: { readonly displayName: string } | null): string {
  if (profile === null) {
    return "Unnamed collaborator";
  }

  return profile.displayName;
}

export async function getAdminCampaignRooms(): Promise<readonly AdminCampaignRoomListItem[]> {
  const campaignRooms = await prisma.campaignRoom.findMany({
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      collaboratorId: true,
      campaignCode: true,
      title: true,
      summary: true,
      status: true,
      startsAt: true,
      endsAt: true,
      isConfidential: true,
      createdAt: true,
      updatedAt: true,
      collaborator: {
        select: {
          email: true,
          profile: {
            select: {
              displayName: true
            }
          }
        }
      },
      assets: {
        select: {
          id: true,
          isVisible: true
        }
      }
    }
  });

  return campaignRooms.map(
    (campaignRoom): AdminCampaignRoomListItem => ({
      id: campaignRoom.id,
      collaboratorId: campaignRoom.collaboratorId,
      collaboratorName: getDisplayName(campaignRoom.collaborator.profile),
      collaboratorEmail: campaignRoom.collaborator.email,
      campaignCode: campaignRoom.campaignCode,
      title: campaignRoom.title,
      summary: campaignRoom.summary,
      status: campaignRoom.status,
      startsAt: campaignRoom.startsAt,
      endsAt: campaignRoom.endsAt,
      isConfidential: campaignRoom.isConfidential,
      assetCount: campaignRoom.assets.length,
      visibleAssetCount: campaignRoom.assets.filter((asset): boolean => asset.isVisible).length,
      createdAt: campaignRoom.createdAt,
      updatedAt: campaignRoom.updatedAt
    })
  );
}

export async function getAdminCampaignRoomDetail(
  campaignRoomId: string
): Promise<AdminCampaignRoomDetail | null> {
  const campaignRoom = await prisma.campaignRoom.findUnique({
    where: {
      id: campaignRoomId
    },
    select: {
      id: true,
      collaboratorId: true,
      campaignCode: true,
      title: true,
      summary: true,
      status: true,
      startsAt: true,
      endsAt: true,
      isConfidential: true,
      createdAt: true,
      updatedAt: true,
      collaborator: {
        select: {
          email: true,
          profile: {
            select: {
              displayName: true
            }
          }
        }
      },
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
  });

  if (campaignRoom === null) {
    return null;
  }

  return {
    id: campaignRoom.id,
    collaboratorId: campaignRoom.collaboratorId,
    collaboratorName: getDisplayName(campaignRoom.collaborator.profile),
    collaboratorEmail: campaignRoom.collaborator.email,
    campaignCode: campaignRoom.campaignCode,
    title: campaignRoom.title,
    summary: campaignRoom.summary,
    status: campaignRoom.status,
    startsAt: campaignRoom.startsAt,
    endsAt: campaignRoom.endsAt,
    isConfidential: campaignRoom.isConfidential,
    createdAt: campaignRoom.createdAt,
    updatedAt: campaignRoom.updatedAt,
    assets: campaignRoom.assets
  };
}
