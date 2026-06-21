-- CreateTable
CREATE TABLE "CreativeProfilePage" (
    "id" TEXT NOT NULL,
    "creativeId" TEXT NOT NULL,
    "publicHandle" VARCHAR(80) NOT NULL,
    "headline" VARCHAR(220) NOT NULL,
    "bio" VARCHAR(1600),
    "locationLabel" VARCHAR(120),
    "websiteUrl" VARCHAR(2048),
    "contactEmail" VARCHAR(320),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreativeProfilePage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreativePortfolioItem" (
    "id" TEXT NOT NULL,
    "creativeId" TEXT NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "category" VARCHAR(120) NOT NULL,
    "description" VARCHAR(1200),
    "mediaUrl" VARCHAR(2048),
    "externalUrl" VARCHAR(2048),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreativePortfolioItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreativeProfilePage_creativeId_key" ON "CreativeProfilePage"("creativeId");

-- CreateIndex
CREATE UNIQUE INDEX "CreativeProfilePage_publicHandle_key" ON "CreativeProfilePage"("publicHandle");

-- CreateIndex
CREATE INDEX "CreativeProfilePage_creativeId_isPublished_idx" ON "CreativeProfilePage"("creativeId", "isPublished");

-- CreateIndex
CREATE INDEX "CreativeProfilePage_publicHandle_isPublished_idx" ON "CreativeProfilePage"("publicHandle", "isPublished");

-- CreateIndex
CREATE INDEX "CreativePortfolioItem_creativeId_isPublished_sortOrder_idx" ON "CreativePortfolioItem"("creativeId", "isPublished", "sortOrder");

-- AddForeignKey
ALTER TABLE "CreativeProfilePage" ADD CONSTRAINT "CreativeProfilePage_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreativePortfolioItem" ADD CONSTRAINT "CreativePortfolioItem_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
