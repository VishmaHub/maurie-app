-- CreateTable
CREATE TABLE "BusinessListing" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "publicSlug" VARCHAR(140) NOT NULL,
    "businessName" VARCHAR(180) NOT NULL,
    "headline" VARCHAR(220) NOT NULL,
    "description" VARCHAR(1600),
    "websiteUrl" VARCHAR(2048),
    "contactEmail" VARCHAR(320),
    "contactPhoneE164" VARCHAR(32),
    "seoTitle" VARCHAR(180),
    "seoDescription" VARCHAR(300),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingOffer" (
    "id" TEXT NOT NULL,
    "businessListingId" TEXT NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "description" VARCHAR(1200),
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessListing_publicSlug_key" ON "BusinessListing"("publicSlug");

-- CreateIndex
CREATE INDEX "BusinessListing_clientId_isPublished_idx" ON "BusinessListing"("clientId", "isPublished");

-- CreateIndex
CREATE INDEX "BusinessListing_publicSlug_isPublished_idx" ON "BusinessListing"("publicSlug", "isPublished");

-- CreateIndex
CREATE INDEX "ListingOffer_businessListingId_isActive_idx" ON "ListingOffer"("businessListingId", "isActive");

-- AddForeignKey
ALTER TABLE "BusinessListing" ADD CONSTRAINT "BusinessListing_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingOffer" ADD CONSTRAINT "ListingOffer_businessListingId_fkey" FOREIGN KEY ("businessListingId") REFERENCES "BusinessListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
