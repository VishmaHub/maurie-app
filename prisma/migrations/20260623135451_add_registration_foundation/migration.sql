-- CreateEnum
CREATE TYPE "AccountApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CollaboratorApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "approvalStatus" "AccountApprovalStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "authSessionVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CollaboratorApplication" (
    "id" TEXT NOT NULL,
    "collaboratorId" TEXT NOT NULL,
    "organisationName" VARCHAR(180) NOT NULL,
    "organisationType" VARCHAR(120) NOT NULL,
    "contactName" VARCHAR(160) NOT NULL,
    "partnershipInterestSummary" VARCHAR(1600) NOT NULL,
    "status" "CollaboratorApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "nonBindingAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" VARCHAR(1200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaboratorApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollaboratorApplication_collaboratorId_status_idx" ON "CollaboratorApplication"("collaboratorId", "status");

-- CreateIndex
CREATE INDEX "CollaboratorApplication_status_createdAt_idx" ON "CollaboratorApplication"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CollaboratorApplication_reviewedById_idx" ON "CollaboratorApplication"("reviewedById");

-- CreateIndex
CREATE INDEX "User_approvalStatus_isActive_idx" ON "User"("approvalStatus", "isActive");

-- AddForeignKey
ALTER TABLE "CollaboratorApplication" ADD CONSTRAINT "CollaboratorApplication_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratorApplication" ADD CONSTRAINT "CollaboratorApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
