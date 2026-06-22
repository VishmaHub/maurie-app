import { prisma } from "@/lib/prisma";

export interface CollaboratorCampaignAsset {
  readonly id: string;
  readonly title: string;
  readonly assetType: string;
  readonly description: string | null;
  readonly resourceUrl: string | null;
  readonly isVisible: boolean;
  readonly createdAt: Date;
}

export interface CollaboratorCampaignListItem {
  readonly id: string;
  readonly campaignCode: string;
  readonly title: string;
  readonly summary: string | null;
  readonly status: string;
  readonly startsAt: Date | null;
  readonly endsAt: Date | null;
  readonly isConfidential: boolean;
  readonly assetCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CollaboratorCampaignDetail {
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
  readonly assets: readonly CollaboratorCampaignAsset[];
}

export async function getCollaboratorCampaigns(
  userId: string
): Promise<readonly CollaboratorCampaignListItem[]> {
  const campaigns = await prisma.campaignRoom.findMany({
    where: {
      collaboratorId: userId
    },
    orderBy: {
      updatedAt: "desc"
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
        where: {
          isVisible: true
        },
        select: {
          id: true
        }
      }
    }
  });

  return campaigns.map(
    (campaign): CollaboratorCampaignListItem => ({
      id: campaign.id,
      campaignCode: campaign.campaignCode,
      title: campaign.title,
      summary: campaign.summary,
      status: campaign.status,
      startsAt: campaign.startsAt,
      endsAt: campaign.endsAt,
      isConfidential: campaign.isConfidential,
      assetCount: campaign.assets.length,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt
    })
  );
}

export async function getCollaboratorCampaignDetail(input: {
  readonly userId: string;
  readonly campaignId: string;
}): Promise<CollaboratorCampaignDetail | null> {
  const campaign = await prisma.campaignRoom.findFirst({
    where: {
      id: input.campaignId,
      collaboratorId: input.userId
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
        where: {
          isVisible: true
        },
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
          createdAt: true
        }
      }
    }
  });

  return campaign;
}
