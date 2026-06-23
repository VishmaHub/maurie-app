"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { createActionError, createValidationError } from "@/lib/actions/action-response";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import {
  businessListingSchema,
  updateBusinessListingSchema,
  type BusinessListingInput,
  type UpdateBusinessListingInput
} from "@/lib/validation/business-listing";
import { formDataToRecord } from "@/lib/validation/crud";
import type { ActionResponse } from "@/types/action-response";

const SLUG_CONFLICT_MESSAGE = "That public slug is already used by another listing.";

function optionalValue(value: string | undefined): string | null {
  return value ?? null;
}

function getListingData(input: BusinessListingInput) {
  return {
    clientId: input.clientId,
    businessName: input.businessName,
    publicSlug: input.publicSlug,
    headline: input.headline,
    description: optionalValue(input.description),
    websiteUrl: optionalValue(input.websiteUrl),
    contactEmail: optionalValue(input.contactEmail),
    contactPhoneE164: optionalValue(input.contactPhoneE164),
    seoTitle: optionalValue(input.seoTitle),
    seoDescription: optionalValue(input.seoDescription),
    isPublished: input.isPublished
  };
}

function getSlugConflictError(): ActionResponse {
  return createActionError(SLUG_CONFLICT_MESSAGE, "CONFLICT", {
    publicSlug: [SLUG_CONFLICT_MESSAGE]
  });
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function revalidateListingPaths(listingId: string, publicSlugs: readonly string[]): void {
  revalidatePath("/dashboard/admin/listings");
  revalidatePath(`/dashboard/admin/listings/${listingId}`);

  for (const publicSlug of new Set(publicSlugs)) {
    revalidatePath(`/l/${publicSlug}`);
  }
}

async function getClientForMutation(clientId: string) {
  return prisma.user.findFirst({
    where: {
      id: clientId,
      role: "CLIENT"
    },
    select: {
      id: true,
      email: true,
      isActive: true
    }
  });
}

export async function createBusinessListingAction(
  _previousState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const session = await requireRole("ADMIN");
  const parsed = businessListingSchema.safeParse(formDataToRecord(formData));

  if (!parsed.success) {
    return createValidationError(parsed.error);
  }

  const input = parsed.data;
  const [client, slugConflict] = await Promise.all([
    getClientForMutation(input.clientId),
    prisma.businessListing.findUnique({
      where: {
        publicSlug: input.publicSlug
      },
      select: {
        id: true
      }
    })
  ]);

  if (client === null || !client.isActive) {
    return createActionError("Select an active client account.", "VALIDATION_ERROR", {
      clientId: ["Select an active client account."]
    });
  }

  if (slugConflict !== null) {
    return getSlugConflictError();
  }

  let listingId: string;

  try {
    listingId = await prisma.$transaction(async (transaction): Promise<string> => {
      const listing = await transaction.businessListing.create({
        data: getListingData(input),
        select: {
          id: true
        }
      });

      await writeAuditLog(
        {
          actorId: session.userId,
          action: "ADMIN_LISTING_CREATE",
          resourceType: "BusinessListing",
          resourceId: listing.id,
          metadata: {
            clientId: input.clientId,
            publicSlug: input.publicSlug,
            isPublished: input.isPublished
          }
        },
        transaction
      );

      return listing.id;
    });
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return getSlugConflictError();
    }

    return createActionError("The listing could not be created. Please try again.");
  }

  revalidateListingPaths(listingId, [input.publicSlug]);
  redirect(`/dashboard/admin/listings/${listingId}`);
}

function getChangedFields(
  current: ReturnType<typeof getListingData>,
  next: ReturnType<typeof getListingData>
): string {
  const changedFields: string[] = [];

  for (const key of Object.keys(next) as (keyof typeof next)[]) {
    if (current[key] !== next[key]) {
      changedFields.push(key);
    }
  }

  return changedFields.join(",");
}

export async function updateBusinessListingAction(
  _previousState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const session = await requireRole("ADMIN");
  const parsed = updateBusinessListingSchema.safeParse(formDataToRecord(formData));

  if (!parsed.success) {
    return createValidationError(parsed.error);
  }

  const input: UpdateBusinessListingInput = parsed.data;
  const [listing, client, slugConflict] = await Promise.all([
    prisma.businessListing.findUnique({
      where: {
        id: input.listingId
      },
      select: {
        id: true,
        clientId: true,
        businessName: true,
        publicSlug: true,
        headline: true,
        description: true,
        websiteUrl: true,
        contactEmail: true,
        contactPhoneE164: true,
        seoTitle: true,
        seoDescription: true,
        isPublished: true
      }
    }),
    getClientForMutation(input.clientId),
    prisma.businessListing.findFirst({
      where: {
        publicSlug: input.publicSlug,
        id: {
          not: input.listingId
        }
      },
      select: {
        id: true
      }
    })
  ]);

  if (listing === null) {
    return createActionError("The listing could not be found.", "NOT_FOUND");
  }

  const canKeepInactiveOwner = listing.clientId === input.clientId;

  if (client === null || (!client.isActive && !canKeepInactiveOwner)) {
    return createActionError("Select an active client account.", "VALIDATION_ERROR", {
      clientId: ["Select an active client account."]
    });
  }

  if (slugConflict !== null) {
    return getSlugConflictError();
  }

  const nextData = getListingData(input);
  const currentData = {
    clientId: listing.clientId,
    businessName: listing.businessName,
    publicSlug: listing.publicSlug,
    headline: listing.headline,
    description: listing.description,
    websiteUrl: listing.websiteUrl,
    contactEmail: listing.contactEmail,
    contactPhoneE164: listing.contactPhoneE164,
    seoTitle: listing.seoTitle,
    seoDescription: listing.seoDescription,
    isPublished: listing.isPublished
  };
  const changedFields = getChangedFields(currentData, nextData);

  try {
    await prisma.$transaction(async (transaction): Promise<void> => {
      await transaction.businessListing.update({
        where: {
          id: listing.id
        },
        data: nextData
      });

      await writeAuditLog(
        {
          actorId: session.userId,
          action: "ADMIN_LISTING_UPDATE",
          resourceType: "BusinessListing",
          resourceId: listing.id,
          metadata: {
            changedFields,
            previousPublicSlug: listing.publicSlug,
            nextPublicSlug: input.publicSlug,
            previousPublished: listing.isPublished,
            nextPublished: input.isPublished
          }
        },
        transaction
      );
    });
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return getSlugConflictError();
    }

    return createActionError("The listing could not be updated. Please try again.");
  }

  revalidateListingPaths(listing.id, [listing.publicSlug, input.publicSlug]);
  redirect(`/dashboard/admin/listings/${listing.id}?status=updated`);
}
