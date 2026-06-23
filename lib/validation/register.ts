import { z } from "zod";
import { normaliseEmail } from "@/lib/auth/normalise-email";
import { optionalTrimmedStringSchema, optionalUrlSchema } from "@/lib/validation/crud";

const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 128;

const emailSchema = z
  .string({ error: "Email is required." })
  .trim()
  .email("Enter a valid email address.")
  .max(320, "Email must be 320 characters or fewer.")
  .transform(normaliseEmail);

const passwordSchema = z
  .string({ error: "Password is required." })
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(PASSWORD_MAX_LENGTH, `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`);

const publicIdentifierSchema = (label: string, maxLength: number) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .max(maxLength, `${label} must be ${maxLength} characters or fewer.`)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      `${label} must use lowercase letters, numbers, and single hyphens only.`
    );

const acceptedSchema = (message: string) =>
  z.preprocess(
    (value): boolean => value === true || value === "true" || value === "on",
    z.literal(true, { error: message })
  );

const optionalPhoneSchema = z.preprocess(
  (value): unknown => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
  z
    .string()
    .trim()
    .max(32, "Phone must be 32 characters or fewer.")
    .regex(/^\+[1-9]\d{7,14}$/, "Use international format, for example +61412345678.")
    .optional()
);

const passwordConfirmationCheck = <T extends { password: string; confirmPassword: string }>(
  input: T
): boolean => input.password === input.confirmPassword;

export const creatorRegistrationSchema = z
  .strictObject({
    name: z.string().trim().min(1, "Name is required.").max(160),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    publicHandle: publicIdentifierSchema("Public handle", 80),
    locationLabel: optionalTrimmedStringSchema(120),
    consentAccepted: acceptedSchema("You must accept the terms and privacy notice.")
  })
  .refine(passwordConfirmationCheck, {
    path: ["confirmPassword"],
    message: "Passwords do not match."
  });

export const businessRegistrationSchema = z
  .strictObject({
    contactName: z.string().trim().min(1, "Contact name is required.").max(160),
    businessName: z.string().trim().min(1, "Business name is required.").max(180),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    businessSlug: publicIdentifierSchema("Business slug", 140),
    websiteUrl: optionalUrlSchema(2048),
    phone: optionalPhoneSchema,
    consentAccepted: acceptedSchema("You must accept the terms and privacy notice.")
  })
  .refine(passwordConfirmationCheck, {
    path: ["confirmPassword"],
    message: "Passwords do not match."
  });

export const collaboratorRegistrationSchema = z
  .strictObject({
    organisationName: z.string().trim().min(1, "Organisation name is required.").max(180),
    contactName: z.string().trim().min(1, "Contact name is required.").max(160),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    organisationType: z.string().trim().min(1, "Organisation type is required.").max(120),
    partnershipInterestSummary: z
      .string()
      .trim()
      .min(20, "Provide at least 20 characters about your partnership interest.")
      .max(1600),
    consentAccepted: acceptedSchema("You must accept the terms and privacy notice."),
    nonBindingAcknowledged: acceptedSchema(
      "You must acknowledge that this is a non-binding expression of interest."
    )
  })
  .refine(passwordConfirmationCheck, {
    path: ["confirmPassword"],
    message: "Passwords do not match."
  });

export type CreatorRegistrationInput = z.infer<typeof creatorRegistrationSchema>;
export type BusinessRegistrationInput = z.infer<typeof businessRegistrationSchema>;
export type CollaboratorRegistrationInput = z.infer<typeof collaboratorRegistrationSchema>;
