"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import {
  formatRegisterPageContentForStorage,
  parseRegisterPageContent,
  REGISTER_PAGE_CONTENT_SETTING_KEY
} from "@/lib/public/register-content";

function getFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  return value;
}

function getSafeReturnPath(formData: FormData): string {
  const returnPath = getFormString(formData, "returnPath");

  if (returnPath === null) {
    return "/dashboard/admin/settings";
  }

  if (!returnPath.startsWith("/dashboard/admin/settings")) {
    return "/dashboard/admin/settings";
  }

  return returnPath;
}

function getSettingsRedirectUrl(status: string, key?: string, returnPath?: string): string {
  const targetPath = returnPath ?? "/dashboard/admin/settings";
  const searchParams = new URLSearchParams();

  searchParams.set("status", status);

  if (typeof key === "string" && key.length > 0) {
    searchParams.set("key", key);
  }

  return `${targetPath}?${searchParams.toString()}`;
}

function normaliseRegisterContentValue(rawValue: string): string | null {
  const value = rawValue.trim();

  if (value.length === 0) {
    return null;
  }

  const parsedRegisterContent = parseRegisterPageContent(value);

  if (parsedRegisterContent === null) {
    return null;
  }

  return formatRegisterPageContentForStorage(parsedRegisterContent);
}

function normaliseJsonSettingValue(rawValue: string): string | null {
  const value = rawValue.trim();

  if (value.length === 0) {
    return null;
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return null;
  }
}

function normaliseSettingValue(
  settingKey: string,
  valueType: string,
  rawValue: string
): string | null {
  const value = rawValue.trim();

  if (value.length === 0) {
    return null;
  }

  /**
   * Register page content is validated by key, not only by valueType.
   *
   * This protects the editor even if the PlatformSetting row was manually
   * created with valueType STRING instead of JSON.
   */
  if (settingKey === REGISTER_PAGE_CONTENT_SETTING_KEY) {
    return normaliseRegisterContentValue(rawValue);
  }

  if (valueType === "SECRET") {
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

  if (valueType === "JSON") {
    return normaliseJsonSettingValue(rawValue);
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
  const returnPath = getSafeReturnPath(formData);

  if (settingId === null || rawValue === null) {
    redirect(getSettingsRedirectUrl("invalid", undefined, returnPath));
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
    redirect(getSettingsRedirectUrl("not-found", undefined, returnPath));
  }

  if (setting.isSensitive) {
    redirect(getSettingsRedirectUrl("locked", setting.key, returnPath));
  }

  const nextValue = normaliseSettingValue(setting.key, setting.valueType, rawValue);

  if (nextValue === null) {
    redirect(getSettingsRedirectUrl("invalid", setting.key, returnPath));
  }

  await prisma.platformSetting.update({
    where: {
      id: setting.id
    },
    data: {
      value: nextValue,
      valueType:
        setting.key === REGISTER_PAGE_CONTENT_SETTING_KEY && setting.valueType !== "JSON"
          ? "JSON"
          : setting.valueType
    }
  });

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_SETTING_UPDATE",
    resourceType: "PlatformSetting",
    resourceId: setting.id,
    metadata: {
      key: setting.key,
      valueType: setting.key === REGISTER_PAGE_CONTENT_SETTING_KEY ? "JSON" : setting.valueType,
      changed: setting.value !== nextValue
    }
  });

  revalidatePath("/dashboard/admin/settings");
  revalidatePath(returnPath);

  if (setting.key === REGISTER_PAGE_CONTENT_SETTING_KEY) {
    revalidatePath("/register");
  }

  redirect(getSettingsRedirectUrl("updated", setting.key, returnPath));
}
