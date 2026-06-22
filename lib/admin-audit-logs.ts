import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export interface AdminAuditLogListItem {
  readonly id: string;
  readonly actorId: string | null;
  readonly actorName: string | null;
  readonly actorEmail: string | null;
  readonly action: string;
  readonly resourceType: string | null;
  readonly resourceId: string | null;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly createdAt: Date;
}

export interface AdminAuditLogDetail {
  readonly id: string;
  readonly actorId: string | null;
  readonly actorName: string | null;
  readonly actorEmail: string | null;
  readonly action: string;
  readonly resourceType: string | null;
  readonly resourceId: string | null;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly metadata: Prisma.JsonValue;
  readonly createdAt: Date;
}

interface ActorLookupValue {
  readonly email: string;
  readonly displayName: string | null;
}

function getActorName(actor: ActorLookupValue | undefined): string | null {
  if (actor === undefined) {
    return null;
  }

  return actor.displayName ?? actor.email;
}

async function getActorLookup(actorIds: readonly string[]): Promise<Map<string, ActorLookupValue>> {
  const uniqueActorIds: string[] = Array.from(new Set(actorIds));

  if (uniqueActorIds.length === 0) {
    return new Map<string, ActorLookupValue>();
  }

  const actors = await prisma.user.findMany({
    where: {
      id: {
        in: uniqueActorIds
      }
    },
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          displayName: true
        }
      }
    }
  });

  return new Map(
    actors.map((actor) => [
      actor.id,
      {
        email: actor.email,
        displayName: actor.profile?.displayName ?? null
      }
    ])
  );
}

export async function getAdminAuditLogs(): Promise<readonly AdminAuditLogListItem[]> {
  const auditLogs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: {
      timestamp: "desc"
    },
    select: {
      id: true,
      actorId: true,
      action: true,
      resourceType: true,
      resourceId: true,
      ipAddress: true,
      userAgent: true,
      timestamp: true
    }
  });

  const actorIds: string[] = auditLogs
    .map((auditLog): string | null => auditLog.actorId)
    .filter((actorId): actorId is string => actorId !== null);

  const actorLookup: Map<string, ActorLookupValue> = await getActorLookup(actorIds);

  return auditLogs.map((auditLog): AdminAuditLogListItem => {
    const actor: ActorLookupValue | undefined =
      auditLog.actorId === null ? undefined : actorLookup.get(auditLog.actorId);

    return {
      id: auditLog.id,
      actorId: auditLog.actorId,
      actorName: getActorName(actor),
      actorEmail: actor?.email ?? null,
      action: auditLog.action,
      resourceType: auditLog.resourceType,
      resourceId: auditLog.resourceId,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      createdAt: auditLog.timestamp
    };
  });
}

export async function getAdminAuditLogDetail(
  auditLogId: string
): Promise<AdminAuditLogDetail | null> {
  const auditLog = await prisma.auditLog.findUnique({
    where: {
      id: auditLogId
    },
    select: {
      id: true,
      actorId: true,
      action: true,
      resourceType: true,
      resourceId: true,
      ipAddress: true,
      userAgent: true,
      metadata: true,
      timestamp: true
    }
  });

  if (auditLog === null) {
    return null;
  }

  const actorLookup: Map<string, ActorLookupValue> =
    auditLog.actorId === null ? new Map() : await getActorLookup([auditLog.actorId]);

  const actor: ActorLookupValue | undefined =
    auditLog.actorId === null ? undefined : actorLookup.get(auditLog.actorId);

  return {
    id: auditLog.id,
    actorId: auditLog.actorId,
    actorName: getActorName(actor),
    actorEmail: actor?.email ?? null,
    action: auditLog.action,
    resourceType: auditLog.resourceType,
    resourceId: auditLog.resourceId,
    ipAddress: auditLog.ipAddress,
    userAgent: auditLog.userAgent,
    metadata: auditLog.metadata,
    createdAt: auditLog.timestamp
  };
}
