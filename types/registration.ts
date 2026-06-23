import type { ActionResponse } from "@/types/action-response";

export type RegistrationKind = "creator" | "business" | "collaborator";
export type PublicRegistrationRole = "CREATIVE" | "CLIENT" | "COLLABORATOR";

export interface RegistrationActionData {
  readonly userId: string;
  readonly role: PublicRegistrationRole;
  readonly nextPath: string;
}

export type RegistrationActionState = ActionResponse<RegistrationActionData>;

export type RegistrationResult =
  | {
      readonly success: true;
      readonly data: RegistrationActionData;
    }
  | {
      readonly success: false;
      readonly code: "VALIDATION_ERROR" | "CONFLICT" | "UNEXPECTED_ERROR";
      readonly message: string;
    };
