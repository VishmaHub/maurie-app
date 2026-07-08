"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import {
  formatRegisterPageContentForStorage,
  parseRegisterPageContent,
  REGISTER_PAGE_CONTENT_SETTING_KEY,
  type RegisterInfoBlockContent,
  type RegisterPageContent,
  type RegisterPathwayContent
} from "@/lib/public/register-content";

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getPositiveCount(formData: FormData, key: string, fallback: number): number {
  const value = Number(getFormString(formData, key));

  if (!Number.isInteger(value) || value < 1 || value > 6) {
    return fallback;
  }

  return value;
}

function getTextareaLines(formData: FormData, key: string): readonly string[] {
  return getFormString(formData, key)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function buildPathwaysFromFormData(formData: FormData): readonly RegisterPathwayContent[] {
  const pathwayCount = getPositiveCount(formData, "pathwayCount", 3);

  return Array.from({ length: pathwayCount }, (_, index): RegisterPathwayContent => {
    const prefix = `pathway-${index}`;

    return {
      title: getFormString(formData, `${prefix}-title`),
      eyebrow: getFormString(formData, `${prefix}-eyebrow`),
      description: getFormString(formData, `${prefix}-description`),
      href: getFormString(formData, `${prefix}-href`),
      label: getFormString(formData, `${prefix}-label`),
      status: getFormString(formData, `${prefix}-status`),
      highlights: getTextareaLines(formData, `${prefix}-highlights`)
    };
  });
}

function buildInfoBlocksFromFormData(formData: FormData): readonly RegisterInfoBlockContent[] {
  const infoBlockCount = getPositiveCount(formData, "infoBlockCount", 3);

  return Array.from({ length: infoBlockCount }, (_, index): RegisterInfoBlockContent => {
    const prefix = `info-${index}`;

    return {
      title: getFormString(formData, `${prefix}-title`),
      description: getFormString(formData, `${prefix}-description`)
    };
  });
}

function buildRegisterPageContentFromFormData(formData: FormData): RegisterPageContent | null {
  const content: RegisterPageContent = {
    brandTitle: getFormString(formData, "brandTitle"),
    brandSubtitle: getFormString(formData, "brandSubtitle"),
    badge: getFormString(formData, "badge"),
    heading: getFormString(formData, "heading"),
    description: getFormString(formData, "description"),
    loginHref: getFormString(formData, "loginHref"),
    pathways: buildPathwaysFromFormData(formData),
    infoBlocks: buildInfoBlocksFromFormData(formData)
  };

  return parseRegisterPageContent(JSON.stringify(content));
}

function getRedirectUrl(status: string): string {
  const searchParams = new URLSearchParams();
  searchParams.set("status", status);

  return `/dashboard/admin/settings/register-content?${searchParams.toString()}`;
}

/**
 * Saves structured register page content into PlatformSetting.
 *
 * The action validates the final content shape before saving, so /register
 * cannot be broken by incomplete admin form submissions.
 */
export async function updateRegisterContentAction(formData: FormData): Promise<void> {
  const session = await requireRole("ADMIN");
  const content = buildRegisterPageContentFromFormData(formData);

  if (content === null) {
    redirect(getRedirectUrl("invalid"));
  }

  const nextValue = formatRegisterPageContentForStorage(content);

  const setting = await prisma.platformSetting.upsert({
    where: {
      key: REGISTER_PAGE_CONTENT_SETTING_KEY
    },
    update: {
      label: "Public Register Page Content",
      description: "Controls the copy and pathway cards shown on the public /register page.",
      category: "Public Content",
      value: nextValue,
      valueType: "JSON",
      isSensitive: false
    },
    create: {
      key: REGISTER_PAGE_CONTENT_SETTING_KEY,
      label: "Public Register Page Content",
      description: "Controls the copy and pathway cards shown on the public /register page.",
      category: "Public Content",
      value: nextValue,
      valueType: "JSON",
      isSensitive: false
    },
    select: {
      id: true,
      key: true
    }
  });

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_SETTING_UPDATE",
    resourceType: "PlatformSetting",
    resourceId: setting.id,
    metadata: {
      key: setting.key,
      editor: "structured-register-content",
      valueType: "JSON"
    }
  });

  revalidatePath("/register");
  revalidatePath("/dashboard/admin/settings");
  revalidatePath("/dashboard/admin/settings/register-content");

  redirect(getRedirectUrl("updated"));
}
