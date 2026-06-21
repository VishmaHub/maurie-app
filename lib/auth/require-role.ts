import { redirect } from "next/navigation";
import type { UserRole } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAuthenticatedSession, type AuthenticatedSession } from "@/lib/auth/session";

export async function requireAuthenticatedSession(): Promise<AuthenticatedSession> {
  const session: AuthenticatedSession | null = await getAuthenticatedSession();

  if (session === null) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(requiredRole: UserRole): Promise<AuthenticatedSession> {
  const session: AuthenticatedSession = await requireAuthenticatedSession();

  if (session.role !== requiredRole) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "Dashboard",
      resourceId: requiredRole,
      metadata: {
        actualRole: session.role,
        requiredRole
      }
    });

    redirect("/dashboard");
  }

  return session;
}
