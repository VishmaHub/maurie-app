"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  AccountApprovalStatus,
  CollaboratorApplicationStatus,
  UserRole
} from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { hashPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  businessRegistrationSchema,
  collaboratorRegistrationSchema,
  creatorRegistrationSchema,
  type BusinessRegistrationInput,
  type CollaboratorRegistrationInput,
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

export interface BusinessRegistrationFieldErrors {
  readonly contactName: readonly string[];
  readonly businessName: readonly string[];
  readonly email: readonly string[];
  readonly password: readonly string[];
  readonly confirmPassword: readonly string[];
  readonly businessSlug: readonly string[];
  readonly websiteUrl: readonly string[];
  readonly phone: readonly string[];
  readonly consentAccepted: readonly string[];
}

export interface CollaboratorRegistrationFieldErrors {
  readonly organisationName: readonly string[];
  readonly contactName: readonly string[];
  readonly email: readonly string[];
  readonly password: readonly string[];
  readonly confirmPassword: readonly string[];
  readonly organisationType: readonly string[];
  readonly partnershipInterestSummary: readonly string[];
  readonly consentAccepted: readonly string[];
  readonly nonBindingAcknowledged: readonly string[];
}

export interface CreatorRegistrationActionState {
  readonly status: "idle" | "error";
  readonly message: string;
  readonly fieldErrors: CreatorRegistrationFieldErrors;
}

export interface BusinessRegistrationActionState {
  readonly status: "idle" | "error";
  readonly message: string;
  readonly fieldErrors: BusinessRegistrationFieldErrors;
}

export interface CollaboratorRegistrationActionState {
  readonly status: "idle" | "error";
  readonly message: string;
  readonly fieldErrors: CollaboratorRegistrationFieldErrors;
}

type CreatorRegistrationSchemaFieldErrors = Partial<
  Record<keyof CreatorRegistrationFieldErrors, string[]>
>;

type BusinessRegistrationSchemaFieldErrors = Partial<
  Record<keyof BusinessRegistrationFieldErrors, string[]>
>;

type CollaboratorRegistrationSchemaFieldErrors = Partial<
  Record<keyof CollaboratorRegistrationFieldErrors, string[]>
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

const emptyBusinessRegistrationFieldErrors: BusinessRegistrationFieldErrors = {
  contactName: [],
  businessName: [],
  email: [],
  password: [],
  confirmPassword: [],
  businessSlug: [],
  websiteUrl: [],
  phone: [],
  consentAccepted: []
};

const emptyCollaboratorRegistrationFieldErrors: CollaboratorRegistrationFieldErrors = {
  organisationName: [],
  contactName: [],
  email: [],
  password: [],
  confirmPassword: [],
  organisationType: [],
  partnershipInterestSummary: [],
  consentAccepted: [],
  nonBindingAcknowledged: []
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

function getBusinessRegistrationFieldErrors(
  fieldErrors: BusinessRegistrationSchemaFieldErrors
): BusinessRegistrationFieldErrors {
  return {
    contactName: fieldErrors.contactName ?? [],
    businessName: fieldErrors.businessName ?? [],
    email: fieldErrors.email ?? [],
    password: fieldErrors.password ?? [],
    confirmPassword: fieldErrors.confirmPassword ?? [],
    businessSlug: fieldErrors.businessSlug ?? [],
    websiteUrl: fieldErrors.websiteUrl ?? [],
    phone: fieldErrors.phone ?? [],
    consentAccepted: fieldErrors.consentAccepted ?? []
  };
}

function getCollaboratorRegistrationFieldErrors(
  fieldErrors: CollaboratorRegistrationSchemaFieldErrors
): CollaboratorRegistrationFieldErrors {
  return {
    organisationName: fieldErrors.organisationName ?? [],
    contactName: fieldErrors.contactName ?? [],
    email: fieldErrors.email ?? [],
    password: fieldErrors.password ?? [],
    confirmPassword: fieldErrors.confirmPassword ?? [],
    organisationType: fieldErrors.organisationType ?? [],
    partnershipInterestSummary: fieldErrors.partnershipInterestSummary ?? [],
    consentAccepted: fieldErrors.consentAccepted ?? [],
    nonBindingAcknowledged: fieldErrors.nonBindingAcknowledged ?? []
  };
}

function hasCreatorRegistrationFieldErrors(fieldErrors: CreatorRegistrationFieldErrors): boolean {
  return Object.values(fieldErrors).some((errors): boolean => errors.length > 0);
}

function hasBusinessRegistrationFieldErrors(fieldErrors: BusinessRegistrationFieldErrors): boolean {
  return Object.values(fieldErrors).some((errors): boolean => errors.length > 0);
}

function hasCollaboratorRegistrationFieldErrors(
  fieldErrors: CollaboratorRegistrationFieldErrors
): boolean {
  return Object.values(fieldErrors).some((errors): boolean => errors.length > 0);
}

function createCreatorErrorState(
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

function createBusinessErrorState(
  message: string,
  fieldErrors: Partial<Record<keyof BusinessRegistrationFieldErrors, readonly string[]>>
): BusinessRegistrationActionState {
  return {
    status: "error",
    message,
    fieldErrors: {
      contactName: fieldErrors.contactName ?? [],
      businessName: fieldErrors.businessName ?? [],
      email: fieldErrors.email ?? [],
      password: fieldErrors.password ?? [],
      confirmPassword: fieldErrors.confirmPassword ?? [],
      businessSlug: fieldErrors.businessSlug ?? [],
      websiteUrl: fieldErrors.websiteUrl ?? [],
      phone: fieldErrors.phone ?? [],
      consentAccepted: fieldErrors.consentAccepted ?? []
    }
  };
}

function createCollaboratorErrorState(
  message: string,
  fieldErrors: Partial<Record<keyof CollaboratorRegistrationFieldErrors, readonly string[]>>
): CollaboratorRegistrationActionState {
  return {
    status: "error",
    message,
    fieldErrors: {
      organisationName: fieldErrors.organisationName ?? [],
      contactName: fieldErrors.contactName ?? [],
      email: fieldErrors.email ?? [],
      password: fieldErrors.password ?? [],
      confirmPassword: fieldErrors.confirmPassword ?? [],
      organisationType: fieldErrors.organisationType ?? [],
      partnershipInterestSummary: fieldErrors.partnershipInterestSummary ?? [],
      consentAccepted: fieldErrors.consentAccepted ?? [],
      nonBindingAcknowledged: fieldErrors.nonBindingAcknowledged ?? []
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

async function getBusinessUniquenessErrors(
  input: BusinessRegistrationInput
): Promise<BusinessRegistrationFieldErrors> {
  const [existingUser, existingProfile, existingListing] = await Promise.all([
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
        publicSlug: input.businessSlug
      },
      select: {
        id: true
      }
    }),
    prisma.businessListing.findUnique({
      where: {
        publicSlug: input.businessSlug
      },
      select: {
        id: true
      }
    })
  ]);

  return {
    ...emptyBusinessRegistrationFieldErrors,
    email: existingUser === null ? [] : ["An account with this email already exists."],
    businessSlug:
      existingProfile === null && existingListing === null
        ? []
        : ["This business listing slug is already taken."]
  };
}

async function getCollaboratorUniquenessErrors(
  input: CollaboratorRegistrationInput
): Promise<CollaboratorRegistrationFieldErrors> {
  const existingUser = await prisma.user.findUnique({
    where: {
      normalizedEmail: input.email
    },
    select: {
      id: true
    }
  });

  return {
    ...emptyCollaboratorRegistrationFieldErrors,
    email: existingUser === null ? [] : ["An account with this email already exists."]
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
    return createCreatorErrorState(
      "Please review the highlighted fields.",
      getCreatorRegistrationFieldErrors(parsedInput.error.flatten().fieldErrors)
    );
  }

  const input = parsedInput.data;
  const uniquenessErrors = await getCreatorUniquenessErrors(input);

  if (hasCreatorRegistrationFieldErrors(uniquenessErrors)) {
    return createCreatorErrorState("Please review the highlighted fields.", uniquenessErrors);
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
      return createCreatorErrorState("This email or public handle is already in use.", {
        email: ["This email may already be registered."],
        publicHandle: ["This public handle may already be taken."]
      });
    }

    return createCreatorErrorState("We could not create your account. Please try again.", {});
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

export async function registerBusinessAction(
  _previousState: BusinessRegistrationActionState,
  formData: FormData
): Promise<BusinessRegistrationActionState> {
  const parsedInput = businessRegistrationSchema.safeParse({
    contactName: getFormString(formData, "contactName"),
    businessName: getFormString(formData, "businessName"),
    email: getFormString(formData, "email"),
    password: getFormString(formData, "password"),
    confirmPassword: getFormString(formData, "confirmPassword"),
    businessSlug: getFormString(formData, "businessSlug"),
    websiteUrl: getOptionalFormString(formData, "websiteUrl"),
    phone: getOptionalFormString(formData, "phone"),
    consentAccepted: formData.get("consentAccepted")
  });

  if (!parsedInput.success) {
    return createBusinessErrorState(
      "Please review the highlighted fields.",
      getBusinessRegistrationFieldErrors(parsedInput.error.flatten().fieldErrors)
    );
  }

  const input = parsedInput.data;
  const uniquenessErrors = await getBusinessUniquenessErrors(input);

  if (hasBusinessRegistrationFieldErrors(uniquenessErrors)) {
    return createBusinessErrorState("Please review the highlighted fields.", uniquenessErrors);
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
          role: UserRole.CLIENT,
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
          publicSlug: input.businessSlug,
          displayName: input.contactName,
          bio: `${input.businessName} business contact profile.`,
          phoneE164: input.phone ?? null,
          websiteUrl: input.websiteUrl ?? null,
          isPublic: false
        }
      });

      await transaction.businessListing.create({
        data: {
          clientId: user.id,
          businessName: input.businessName,
          publicSlug: input.businessSlug,
          headline: "Business listing in progress",
          description: "This business is preparing its Mauri-E listing.",
          websiteUrl: input.websiteUrl ?? null,
          contactEmail: input.email,
          contactPhoneE164: input.phone ?? null,
          seoTitle: input.businessName,
          seoDescription: `Learn more about ${input.businessName} on Mauri-E.`,
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
            registrationType: "BUSINESS",
            businessSlug: input.businessSlug
          }
        },
        transaction
      );

      return user;
    });
  } catch (error: unknown) {
    if (hasPrismaErrorCode(error, "P2002")) {
      return createBusinessErrorState("This email or business slug is already in use.", {
        email: ["This email may already be registered."],
        businessSlug: ["This business listing slug may already be taken."]
      });
    }

    return createBusinessErrorState(
      "We could not create your business account. Please try again.",
      {}
    );
  }

  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/clients");
  revalidatePath("/dashboard/admin/listings");
  revalidatePath("/dashboard/admin/audit-logs");
  revalidatePath(`/l/${input.businessSlug}`);

  await createSessionCookie({
    userId: createdUser.id,
    role: createdUser.role
  });

  redirect("/dashboard/client");
}

export async function registerCollaboratorAction(
  _previousState: CollaboratorRegistrationActionState,
  formData: FormData
): Promise<CollaboratorRegistrationActionState> {
  const parsedInput = collaboratorRegistrationSchema.safeParse({
    organisationName: getFormString(formData, "organisationName"),
    contactName: getFormString(formData, "contactName"),
    email: getFormString(formData, "email"),
    password: getFormString(formData, "password"),
    confirmPassword: getFormString(formData, "confirmPassword"),
    organisationType: getFormString(formData, "organisationType"),
    partnershipInterestSummary: getFormString(formData, "partnershipInterestSummary"),
    consentAccepted: formData.get("consentAccepted"),
    nonBindingAcknowledged: formData.get("nonBindingAcknowledged")
  });

  if (!parsedInput.success) {
    return createCollaboratorErrorState(
      "Please review the highlighted fields.",
      getCollaboratorRegistrationFieldErrors(parsedInput.error.flatten().fieldErrors)
    );
  }

  const input = parsedInput.data;
  const uniquenessErrors = await getCollaboratorUniquenessErrors(input);

  if (hasCollaboratorRegistrationFieldErrors(uniquenessErrors)) {
    return createCollaboratorErrorState("Please review the highlighted fields.", uniquenessErrors);
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
          role: UserRole.COLLABORATOR,
          isActive: true,
          approvalStatus: AccountApprovalStatus.PENDING
        },
        select: {
          id: true,
          role: true
        }
      });

      await transaction.profile.create({
        data: {
          userId: user.id,
          publicSlug: `collaborator-${user.id}`,
          displayName: input.contactName,
          bio: `${input.organisationName} collaborator contact profile.`,
          isPublic: false
        }
      });

      const application = await transaction.collaboratorApplication.create({
        data: {
          collaboratorId: user.id,
          organisationName: input.organisationName,
          organisationType: input.organisationType,
          contactName: input.contactName,
          partnershipInterestSummary: input.partnershipInterestSummary,
          status: CollaboratorApplicationStatus.PENDING,
          nonBindingAcknowledged: true
        },
        select: {
          id: true
        }
      });

      await writeAuditLog(
        {
          actorId: user.id,
          action: "PUBLIC_REGISTRATION_CREATE",
          resourceType: "User",
          resourceId: user.id,
          metadata: {
            registrationType: "COLLABORATOR"
          }
        },
        transaction
      );

      await writeAuditLog(
        {
          actorId: user.id,
          action: "COLLABORATOR_APPLICATION_CREATE",
          resourceType: "CollaboratorApplication",
          resourceId: application.id,
          metadata: {
            status: "PENDING",
            nonBindingAcknowledged: true
          }
        },
        transaction
      );

      return user;
    });
  } catch (error: unknown) {
    if (hasPrismaErrorCode(error, "P2002")) {
      return createCollaboratorErrorState("This email is already in use.", {
        email: ["This email may already be registered."]
      });
    }

    return createCollaboratorErrorState(
      "We could not create your collaborator account. Please try again.",
      {}
    );
  }

  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/collaborators");
  revalidatePath("/dashboard/admin/audit-logs");

  await createSessionCookie({
    userId: createdUser.id,
    role: createdUser.role
  });

  redirect("/dashboard/collaborator");
}
