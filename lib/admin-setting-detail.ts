import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export interface AdminSettingAuditTrailItem {
  readonly id: string;
  readonly actorId: string | null;
  readonly actorName: string | null;
  readonly actorEmail: string | null;
  readonly action: string;
  readonly resourceType: string | null;
  readonly resourceId: string | null;
  readonly metadata: Prisma.JsonValue;
  readonly timestamp: Date;
}

export interface AdminSettingDetail {
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly description: string | null;
  readonly category: string;
  readonly value: string;
  readonly rawValue: string;
  readonly valueType: string;
  readonly isSensitive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly auditTrail: readonly AdminSettingAuditTrailItem[];
}

interface ActorLookupValue {
  readonly email: string;
  readonly displayName: string | null;
}

function maskSettingValue(isSensitive: boolean, value: string): string {
  if (!isSensitive) {
    return value;
  }

  return "••••••••••••";
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

export async function getAdminSettingDetail(settingId: string): Promise<AdminSettingDetail | null> {
  const setting = await prisma.platformSetting.findUnique({
    where: {
      id: settingId
    },
    select: {
      id: true,
      key: true,
      label: true,
      description: true,
      category: true,
      value: true,
      valueType: true,
      isSensitive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (setting === null) {
    return null;
  }

  const auditLogs = await prisma.auditLog.findMany({
    take: 50,
    where: {
      resourceType: "PlatformSetting",
      resourceId: setting.id
    },
    orderBy: {
      timestamp: "desc"
    },
    select: {
      id: true,
      actorId: true,
      action: true,
      resourceType: true,
      resourceId: true,
      metadata: true,
      timestamp: true
    }
  });

  const actorIds: string[] = auditLogs
    .map((auditLog): string | null => auditLog.actorId)
    .filter((actorId): actorId is string => actorId !== null);

  const actorLookup = await getActorLookup(actorIds);

  return {
    id: setting.id,
    key: setting.key,
    label: setting.label,
    description: setting.description,
    category: setting.category,
    value: maskSettingValue(setting.isSensitive, setting.value),
    rawValue: setting.value,
    valueType: setting.valueType,
    isSensitive: setting.isSensitive,
    createdAt: setting.createdAt,
    updatedAt: setting.updatedAt,
    auditTrail: auditLogs.map((auditLog): AdminSettingAuditTrailItem => {
      const actor = auditLog.actorId === null ? undefined : actorLookup.get(auditLog.actorId);

      return {
        id: auditLog.id,
        actorId: auditLog.actorId,
        actorName: getActorName(actor),
        actorEmail: actor?.email ?? null,
        action: auditLog.action,
        resourceType: auditLog.resourceType,
        resourceId: auditLog.resourceId,
        metadata: auditLog.metadata,
        timestamp: auditLog.timestamp
      };
    })
  };
}
