-- CreateEnum
CREATE TYPE "CampaignRoomStatus" AS ENUM ('DRAFT', 'ACTIVE', 'REVIEW', 'COMPLETED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "CampaignRoom" (
    "id" TEXT NOT NULL,
    "collaboratorId" TEXT NOT NULL,
    "campaignCode" VARCHAR(80) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "summary" VARCHAR(1200),
    "status" "CampaignRoomStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isConfidential" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignRoomAsset" (
    "id" TEXT NOT NULL,
    "campaignRoomId" TEXT NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "assetType" VARCHAR(80) NOT NULL,
    "description" VARCHAR(1200),
    "resourceUrl" VARCHAR(2048),
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignRoomAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignRoom_campaignCode_key" ON "CampaignRoom"("campaignCode");

-- CreateIndex
CREATE INDEX "CampaignRoom_collaboratorId_status_idx" ON "CampaignRoom"("collaboratorId", "status");

-- CreateIndex
CREATE INDEX "CampaignRoom_campaignCode_idx" ON "CampaignRoom"("campaignCode");

-- CreateIndex
CREATE INDEX "CampaignRoomAsset_campaignRoomId_isVisible_idx" ON "CampaignRoomAsset"("campaignRoomId", "isVisible");

-- AddForeignKey
ALTER TABLE "CampaignRoom" ADD CONSTRAINT "CampaignRoom_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRoomAsset" ADD CONSTRAINT "CampaignRoomAsset_campaignRoomId_fkey" FOREIGN KEY ("campaignRoomId") REFERENCES "CampaignRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
