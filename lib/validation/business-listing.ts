import { z } from "zod";
import {
  booleanFormValueSchema,
  optionalTrimmedStringSchema,
  optionalUrlSchema,
  recordIdSchema,
  requiredTrimmedStringSchema
} from "@/lib/validation/crud";

const optionalEmailSchema = z.preprocess(
  (value): unknown => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
  z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid contact email address.")
    .max(320, "Contact email must be 320 characters or fewer.")
    .optional()
);

const optionalPhoneE164Schema = z.preprocess(
  (value): unknown => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
  z
    .string()
    .trim()
    .max(32, "Contact phone must be 32 characters or fewer.")
    .regex(/^\+[1-9]\d{7,14}$/, "Use international format, for example +61412345678.")
    .optional()
);

export const businessListingPublicSlugSchema = z
  .string({ error: "Public slug is required." })
  .trim()
  .min(1, "Public slug is required.")
  .max(140, "Public slug must be 140 characters or fewer.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens only.");

export const businessListingSchema = z.strictObject({
  clientId: recordIdSchema,
  businessName: requiredTrimmedStringSchema("Business name", 180),
  publicSlug: businessListingPublicSlugSchema,
  headline: requiredTrimmedStringSchema("Headline", 220),
  description: optionalTrimmedStringSchema(1600),
  websiteUrl: optionalUrlSchema(2048),
  contactEmail: optionalEmailSchema,
  contactPhoneE164: optionalPhoneE164Schema,
  seoTitle: optionalTrimmedStringSchema(180),
  seoDescription: optionalTrimmedStringSchema(300),
  isPublished: booleanFormValueSchema
});

export const updateBusinessListingSchema = businessListingSchema.extend({
  listingId: recordIdSchema
});

export type BusinessListingInput = z.infer<typeof businessListingSchema>;
export type UpdateBusinessListingInput = z.infer<typeof updateBusinessListingSchema>;
