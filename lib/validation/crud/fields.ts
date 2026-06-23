import { z } from "zod";

const DATABASE_IDENTIFIER_MAX_LENGTH = 191;

export const recordIdSchema = z
  .string({ error: "A record identifier is required." })
  .trim()
  .min(1, "A record identifier is required.")
  .max(DATABASE_IDENTIFIER_MAX_LENGTH, "The record identifier is too long.");

export const booleanFormValueSchema = z
  .enum(["true", "false"], { error: "Select a valid option." })
  .transform((value): boolean => value === "true");

export const nonNegativeIntegerSchema = z.coerce
  .number({ error: "Enter a valid number." })
  .int("Enter a whole number.")
  .min(0, "Enter zero or a positive number.");

export const currencyCodeSchema = z
  .string({ error: "A currency is required." })
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Enter a valid three-letter currency code.");

export function requiredTrimmedStringSchema(label: string, maxLength: number) {
  return z
    .string({ error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .max(maxLength, `${label} must be ${maxLength} characters or fewer.`);
}

export function optionalTrimmedStringSchema(maxLength: number) {
  return z.preprocess(
    (value): unknown =>
      typeof value === "string" && value.trim().length === 0 ? undefined : value,
    z.string().trim().max(maxLength, `Use ${maxLength} characters or fewer.`).optional()
  );
}

export function optionalUrlSchema(maxLength = 2048) {
  return z.preprocess(
    (value): unknown =>
      typeof value === "string" && value.trim().length === 0 ? undefined : value,
    z
      .url({ error: "Enter a valid URL." })
      .max(maxLength, `Use ${maxLength} characters or fewer.`)
      .optional()
  );
}

export function optionalDateSchema() {
  return z.preprocess(
    (value): unknown =>
      typeof value === "string" && value.trim().length === 0 ? undefined : value,
    z.coerce.date({ error: "Enter a valid date." }).optional()
  );
}
