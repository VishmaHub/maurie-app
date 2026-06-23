import { headers } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "ACCESS_DENIED"
  | "DASHBOARD_VIEW"
  | "CLIENT_DATA_READ"
  | "CREATIVE_DATA_READ"
  | "COLLABORATOR_DATA_READ"
  | "ADMIN_DATA_READ"
  | "ADMIN_LISTING_CREATE"
  | "ADMIN_LISTING_UPDATE"
  | "ADMIN_SETTING_UPDATE"
  | "ADMIN_USER_STATUS_UPDATE";

type AuditMetadataValue = string | number | boolean | null;

interface AuditLogInput {
  readonly actorId: string | null;
  readonly action: AuditAction;
  readonly resourceType?: string;
  readonly resourceId?: string;
  readonly metadata?: Record<string, AuditMetadataValue>;
}

function getFirstForwardedIp(forwardedFor: string | null): string | null {
  if (forwardedFor === null || forwardedFor.trim().length === 0) {
    return null;
  }

  const firstIp: string | undefined = forwardedFor.split(",")[0]?.trim();

  if (typeof firstIp !== "string" || firstIp.length === 0) {
    return null;
  }

  return firstIp;
}

type AuditDatabaseClient = Pick<Prisma.TransactionClient, "auditLog">;

export async function writeAuditLog(
  input: AuditLogInput,
  database: AuditDatabaseClient = prisma
): Promise<void> {
  const requestHeaders = await headers();

  const forwardedFor: string | null = requestHeaders.get("x-forwarded-for");
  const realIp: string | null = requestHeaders.get("x-real-ip");
  const userAgent: string | null = requestHeaders.get("user-agent");

  const ipAddress: string | null = realIp ?? getFirstForwardedIp(forwardedFor);

  await database.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      resourceType: input.resourceType ?? null,
      resourceId: input.resourceId ?? null,
      ipAddress,
      userAgent,
      metadata: input.metadata ?? Prisma.DbNull
    }
  });
}
