"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";

function getFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  return value;
}

function getSettingsRedirectUrl(status: string, key?: string): string {
  if (typeof key === "string" && key.length > 0) {
    return `/dashboard/admin/settings?status=${status}&key=${encodeURIComponent(key)}`;
  }

  return `/dashboard/admin/settings?status=${status}`;
}

function normaliseSettingValue(valueType: string, rawValue: string): string | null {
  const value = rawValue.trim();

  if (valueType === "SECRET") {
    return null;
  }

  if (value.length === 0) {
    return null;
  }

  if (valueType === "BOOLEAN") {
    if (value !== "true" && value !== "false") {
      return null;
    }

    return value;
  }

  if (valueType === "NUMBER") {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
      return null;
    }

    return String(numberValue);
  }

  if (valueType === "COLOUR") {
    const hexColourPattern = /^#[0-9a-fA-F]{6}$/;

    if (!hexColourPattern.test(value)) {
      return null;
    }

    return value.toLowerCase();
  }

  if (value.length > 500) {
    return null;
  }

  return value;
}

export async function updatePlatformSettingAction(formData: FormData): Promise<void> {
  const session = await requireRole("ADMIN");

  const settingId = getFormString(formData, "settingId");
  const rawValue = getFormString(formData, "value");

  if (settingId === null || rawValue === null) {
    redirect(getSettingsRedirectUrl("invalid"));
  }

  const setting = await prisma.platformSetting.findUnique({
    where: {
      id: settingId
    },
    select: {
      id: true,
      key: true,
      value: true,
      valueType: true,
      isSensitive: true
    }
  });

  if (setting === null) {
    redirect(getSettingsRedirectUrl("not-found"));
  }

  if (setting.isSensitive) {
    redirect(getSettingsRedirectUrl("locked", setting.key));
  }

  const nextValue = normaliseSettingValue(setting.valueType, rawValue);

  if (nextValue === null) {
    redirect(getSettingsRedirectUrl("invalid", setting.key));
  }

  await prisma.platformSetting.update({
    where: {
      id: setting.id
    },
    data: {
      value: nextValue
    }
  });

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_SETTING_UPDATE",
    resourceType: "PlatformSetting",
    resourceId: setting.id,
    metadata: {
      key: setting.key,
      valueType: setting.valueType,
      changed: setting.value !== nextValue
    }
  });

  revalidatePath("/dashboard/admin/settings");

  redirect(getSettingsRedirectUrl("updated", setting.key));
}
