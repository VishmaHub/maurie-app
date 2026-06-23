import type { z } from "zod";
import type { ActionErrorCode, ActionFieldErrors, ActionResponse } from "@/types/action-response";

const EMPTY_FIELD_ERRORS: ActionFieldErrors = Object.freeze({});

export function createInitialActionResponse<TData = null>(): ActionResponse<TData> {
  return {
    status: "idle",
    message: null,
    code: null,
    fieldErrors: EMPTY_FIELD_ERRORS,
    data: null
  };
}

export function createActionSuccess<TData = null>(
  message: string,
  data: TData | null = null
): ActionResponse<TData> {
  return {
    status: "success",
    message,
    code: null,
    fieldErrors: EMPTY_FIELD_ERRORS,
    data
  };
}

export function createActionError(
  message: string,
  code: ActionErrorCode = "UNEXPECTED_ERROR",
  fieldErrors: ActionFieldErrors = EMPTY_FIELD_ERRORS
): ActionResponse {
  return {
    status: "error",
    message,
    code,
    fieldErrors,
    data: null
  };
}

export function getZodFieldErrors(error: z.ZodError): ActionFieldErrors {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const firstPathSegment = issue.path[0];
    const fieldName =
      typeof firstPathSegment === "string" || typeof firstPathSegment === "number"
        ? String(firstPathSegment)
        : "_form";

    const messages = fieldErrors[fieldName] ?? [];
    messages.push(issue.message);
    fieldErrors[fieldName] = messages;
  }

  return fieldErrors;
}

export function createValidationError(
  error: z.ZodError,
  message = "Please review the highlighted fields."
): ActionResponse {
  return createActionError(message, "VALIDATION_ERROR", getZodFieldErrors(error));
}
