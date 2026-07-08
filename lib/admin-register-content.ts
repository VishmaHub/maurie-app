import { prisma } from "@/lib/prisma";
import {
  DEFAULT_REGISTER_PAGE_CONTENT,
  parseRegisterPageContent,
  REGISTER_PAGE_CONTENT_SETTING_KEY,
  type RegisterPageContent
} from "@/lib/public/register-content";

export interface AdminRegisterContentEditorData {
  readonly settingId: string | null;
  readonly content: RegisterPageContent;
  readonly isUsingFallback: boolean;
  readonly updatedAt: Date | null;
}

/**
 * Loads the register page content for the structured admin editor.
 *
 * If the setting is missing or invalid, the editor falls back to the safe default
 * content instead of exposing a broken admin experience.
 */
export async function getAdminRegisterContentEditorData(): Promise<AdminRegisterContentEditorData> {
  const setting = await prisma.platformSetting.findUnique({
    where: {
      key: REGISTER_PAGE_CONTENT_SETTING_KEY
    },
    select: {
      id: true,
      value: true,
      updatedAt: true
    }
  });

  if (setting === null) {
    return {
      settingId: null,
      content: DEFAULT_REGISTER_PAGE_CONTENT,
      isUsingFallback: true,
      updatedAt: null
    };
  }

  const parsedContent = parseRegisterPageContent(setting.value);

  if (parsedContent === null) {
    return {
      settingId: setting.id,
      content: DEFAULT_REGISTER_PAGE_CONTENT,
      isUsingFallback: true,
      updatedAt: setting.updatedAt
    };
  }

  return {
    settingId: setting.id,
    content: parsedContent,
    isUsingFallback: false,
    updatedAt: setting.updatedAt
  };
}
