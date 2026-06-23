import { z } from "zod";
import { booleanFormValueSchema, recordIdSchema } from "@/lib/validation/crud/fields";

export const crudRecordSchema = z.strictObject({
  id: recordIdSchema
});

export const adminStatusUpdateSchema = z.strictObject({
  id: recordIdSchema,
  isActive: booleanFormValueSchema
});

export const archiveRecordSchema = z.strictObject({
  id: recordIdSchema,
  reason: z.string().trim().min(1, "An archive reason is required.").max(500)
});

export const paginationSchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25)
});
