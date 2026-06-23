export type ActionResponseStatus = "idle" | "success" | "error";

export type ActionErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "FORBIDDEN"
  | "UNEXPECTED_ERROR";

export type ActionFieldErrors = Readonly<Record<string, readonly string[]>>;

/**
 * Serializable response returned by Server Actions that need to report inline
 * validation or mutation feedback. Redirecting actions do not need to use it.
 */
export interface ActionResponse<TData = null> {
  readonly status: ActionResponseStatus;
  readonly message: string | null;
  readonly code: ActionErrorCode | null;
  readonly fieldErrors: ActionFieldErrors;
  readonly data: TData | null;
}
