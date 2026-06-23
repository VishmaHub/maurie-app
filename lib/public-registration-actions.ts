"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AccountApprovalStatus, UserRole } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { hashPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  creatorRegistrationSchema,
  type CreatorRegistrationInput
} from "@/lib/validation/register";

export interface CreatorRegistrationFieldErrors {
  readonly name: readonly string[];
  readonly email: readonly string[];
  readonly password: readonly string[];
  readonly confirmPassword: readonly string[];
  readonly publicHandle: readonly string[];
  readonly locationLabel: readonly string[];
  readonly consentAccepted: readonly string[];
}

export interface CreatorRegistrationActionState {
  readonly status: "idle" | "error";
  readonly message: string;
  readonly fieldErrors: CreatorRegistrationFieldErrors;
}

type CreatorRegistrationSchemaFieldErrors = Partial<
  Record<keyof CreatorRegistrationFieldErrors, string[]>
>;

const emptyCreatorRegistrationFieldErrors: CreatorRegistrationFieldErrors = {
  name: [],
  email: [],
  password: [],
  confirmPassword: [],
  publicHandle: [],
  locationLabel: [],
  consentAccepted: []
};

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value;
}

function getOptionalFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  return value;
}

function getCreatorRegistrationFieldErrors(
  fieldErrors: CreatorRegistrationSchemaFieldErrors
): CreatorRegistrationFieldErrors {
  return {
    name: fieldErrors.name ?? [],
    email: fieldErrors.email ?? [],
    password: fieldErrors.password ?? [],
    confirmPassword: fieldErrors.confirmPassword ?? [],
    publicHandle: fieldErrors.publicHandle ?? [],
    locationLabel: fieldErrors.locationLabel ?? [],
    consentAccepted: fieldErrors.consentAccepted ?? []
  };
}

function hasCreatorRegistrationFieldErrors(fieldErrors: CreatorRegistrationFieldErrors): boolean {
  return Object.values(fieldErrors).some((errors): boolean => errors.length > 0);
}

function createErrorState(
  message: string,
  fieldErrors: Partial<Record<keyof CreatorRegistrationFieldErrors, readonly string[]>>
): CreatorRegistrationActionState {
  return {
    status: "error",
    message,
    fieldErrors: {
      name: fieldErrors.name ?? [],
      email: fieldErrors.email ?? [],
      password: fieldErrors.password ?? [],
      confirmPassword: fieldErrors.confirmPassword ?? [],
      publicHandle: fieldErrors.publicHandle ?? [],
      locationLabel: fieldErrors.locationLabel ?? [],
      consentAccepted: fieldErrors.consentAccepted ?? []
    }
  };
}

function hasPrismaErrorCode(error: unknown, code: string): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  const errorCode = (error as { readonly code?: unknown }).code;

  return errorCode === code;
}

async function getCreatorUniquenessErrors(
  input: CreatorRegistrationInput
): Promise<CreatorRegistrationFieldErrors> {
  const [existingUser, existingProfile, existingCreativeProfile] = await Promise.all([
    prisma.user.findUnique({
      where: {
        normalizedEmail: input.email
      },
      select: {
        id: true
      }
    }),
    prisma.profile.findUnique({
      where: {
        publicSlug: input.publicHandle
      },
      select: {
        id: true
      }
    }),
    prisma.creativeProfilePage.findUnique({
      where: {
        publicHandle: input.publicHandle
      },
      select: {
        id: true
      }
    })
  ]);

  return {
    ...emptyCreatorRegistrationFieldErrors,
    email: existingUser === null ? [] : ["An account with this email already exists."],
    publicHandle:
      existingProfile === null && existingCreativeProfile === null
        ? []
        : ["This public handle is already taken."]
  };
}

export async function registerCreatorAction(
  _previousState: CreatorRegistrationActionState,
  formData: FormData
): Promise<CreatorRegistrationActionState> {
  const parsedInput = creatorRegistrationSchema.safeParse({
    name: getFormString(formData, "name"),
    email: getFormString(formData, "email"),
    password: getFormString(formData, "password"),
    confirmPassword: getFormString(formData, "confirmPassword"),
    publicHandle: getFormString(formData, "publicHandle"),
    locationLabel: getOptionalFormString(formData, "locationLabel"),
    consentAccepted: formData.get("consentAccepted")
  });

  if (!parsedInput.success) {
    return createErrorState(
      "Please review the highlighted fields.",
      getCreatorRegistrationFieldErrors(parsedInput.error.flatten().fieldErrors)
    );
  }

  const input = parsedInput.data;
  const uniquenessErrors = await getCreatorUniquenessErrors(input);

  if (hasCreatorRegistrationFieldErrors(uniquenessErrors)) {
    return createErrorState("Please review the highlighted fields.", uniquenessErrors);
  }

  const passwordHash = await hashPassword(input.password);

  let createdUser: {
    readonly id: string;
    readonly role: UserRole;
  };

  try {
    createdUser = await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          email: input.email,
          normalizedEmail: input.email,
          passwordHash,
          role: UserRole.CREATIVE,
          isActive: true,
          approvalStatus: AccountApprovalStatus.APPROVED
        },
        select: {
          id: true,
          role: true
        }
      });

      await transaction.profile.create({
        data: {
          userId: user.id,
          publicSlug: input.publicHandle,
          displayName: input.name,
          portfolioHeadline: "Creative profile in progress",
          portfolioSummary: "This creator is preparing their Mauri-E profile.",
          isPublic: false
        }
      });

      await transaction.creativeProfilePage.create({
        data: {
          creativeId: user.id,
          publicHandle: input.publicHandle,
          headline: "Creative profile in progress",
          bio: "This creator is preparing their Mauri-E profile.",
          locationLabel: input.locationLabel ?? null,
          contactEmail: input.email,
          isPublished: false
        }
      });

      await writeAuditLog(
        {
          actorId: user.id,
          action: "PUBLIC_REGISTRATION_CREATE",
          resourceType: "User",
          resourceId: user.id,
          metadata: {
            registrationType: "CREATOR",
            publicHandle: input.publicHandle
          }
        },
        transaction
      );

      return user;
    });
  } catch (error: unknown) {
    if (hasPrismaErrorCode(error, "P2002")) {
      return createErrorState("This email or public handle is already in use.", {
        email: ["This email may already be registered."],
        publicHandle: ["This public handle may already be taken."]
      });
    }

    return createErrorState("We could not create your account. Please try again.", {});
  }

  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/creatives");
  revalidatePath("/dashboard/admin/audit-logs");

  await createSessionCookie({
    userId: createdUser.id,
    role: createdUser.role
  });

  redirect("/dashboard/creative");
}
