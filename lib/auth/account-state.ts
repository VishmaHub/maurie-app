import type { AccountApprovalStatus, UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { AuthenticatedSession } from "@/lib/auth/session";

export interface AccountState {
  readonly userId: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly emailVerifiedAt: Date | null;
  readonly onboardingCompletedAt: Date | null;
  readonly approvalStatus: AccountApprovalStatus;
  readonly authSessionVersion: number;
}

export type AccountStateValidation =
  | {
      readonly isValid: true;
      readonly account: AccountState;
    }
  | {
      readonly isValid: false;
      readonly reason: "USER_NOT_FOUND" | "USER_INACTIVE" | "ROLE_MISMATCH";
      readonly account: AccountState | null;
    };

export async function getAccountState(userId: string): Promise<AccountState | null> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      role: true,
      isActive: true,
      emailVerifiedAt: true,
      onboardingCompletedAt: true,
      approvalStatus: true,
      authSessionVersion: true
    }
  });

  if (user === null) {
    return null;
  }

  return {
    userId: user.id,
    role: user.role,
    isActive: user.isActive,
    emailVerifiedAt: user.emailVerifiedAt,
    onboardingCompletedAt: user.onboardingCompletedAt,
    approvalStatus: user.approvalStatus,
    authSessionVersion: user.authSessionVersion
  };
}

export async function validateSessionAccountState(
  session: AuthenticatedSession
): Promise<AccountStateValidation> {
  const account = await getAccountState(session.userId);

  if (account === null) {
    return {
      isValid: false,
      reason: "USER_NOT_FOUND",
      account: null
    };
  }

  if (!account.isActive) {
    return {
      isValid: false,
      reason: "USER_INACTIVE",
      account
    };
  }

  if (account.role !== session.role) {
    return {
      isValid: false,
      reason: "ROLE_MISMATCH",
      account
    };
  }

  return {
    isValid: true,
    account
  };
}
