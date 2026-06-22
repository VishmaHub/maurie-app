import { prisma } from "@/lib/prisma";

export interface AdminPlatformSetting {
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly description: string | null;
  readonly category: string;
  readonly value: string;
  readonly valueType: string;
  readonly isSensitive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminSettingsCategory {
  readonly category: string;
  readonly settings: readonly AdminPlatformSetting[];
}

export interface AdminSettingsData {
  readonly totalSettings: number;
  readonly sensitiveSettings: number;
  readonly categories: readonly AdminSettingsCategory[];
}

interface DefaultPlatformSetting {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly category: string;
  readonly value: string;
  readonly valueType: string;
  readonly isSensitive: boolean;
}

const defaultPlatformSettings: readonly DefaultPlatformSetting[] = [
  {
    key: "platform.name",
    label: "Platform Name",
    description: "Primary internal name used across the Mauri-E operating system.",
    category: "General",
    value: "Mauri-E Platform",
    valueType: "STRING",
    isSensitive: false
  },
  {
    key: "platform.region",
    label: "Primary Region",
    description: "Primary operating region for the current platform configuration.",
    category: "General",
    value: "Australia",
    valueType: "STRING",
    isSensitive: false
  },
  {
    key: "brand.primary_colour",
    label: "Primary Brand Colour",
    description: "Main Mauri-E yellow brand colour.",
    category: "Brand",
    value: "#fdc324",
    valueType: "COLOUR",
    isSensitive: false
  },
  {
    key: "brand.accent_colour",
    label: "Accent Brand Colour",
    description: "Main Mauri-E orange accent colour.",
    category: "Brand",
    value: "#ea6d30",
    valueType: "COLOUR",
    isSensitive: false
  },
  {
    key: "billing.currency",
    label: "Default Billing Currency",
    description: "Default currency used for invoice displays and financial reporting.",
    category: "Billing",
    value: "AUD",
    valueType: "STRING",
    isSensitive: false
  },
  {
    key: "billing.gst_enabled",
    label: "GST Enabled",
    description: "Indicates whether GST-aware invoice reporting is enabled.",
    category: "Billing",
    value: "true",
    valueType: "BOOLEAN",
    isSensitive: false
  },
  {
    key: "security.session_duration_minutes",
    label: "Session Duration",
    description: "Current intended admin session duration in minutes.",
    category: "Security",
    value: "30",
    valueType: "NUMBER",
    isSensitive: false
  },
  {
    key: "security.audit_logging",
    label: "Audit Logging",
    description: "Indicates whether admin audit logging is active.",
    category: "Security",
    value: "true",
    valueType: "BOOLEAN",
    isSensitive: false
  },
  {
    key: "features.admin_search",
    label: "Admin Search",
    description: "Feature flag for the admin platform search module.",
    category: "Features",
    value: "enabled",
    valueType: "STRING",
    isSensitive: false
  },
  {
    key: "features.data_integrity",
    label: "Data Integrity Review",
    description: "Feature flag for admin data health review.",
    category: "Features",
    value: "enabled",
    valueType: "STRING",
    isSensitive: false
  },
  {
    key: "integrations.email_provider",
    label: "Email Provider",
    description: "Placeholder setting for the future transactional email provider.",
    category: "Integrations",
    value: "not_configured",
    valueType: "STRING",
    isSensitive: false
  },
  {
    key: "integrations.payment_provider",
    label: "Payment Provider",
    description: "Placeholder setting for future payment provider configuration.",
    category: "Integrations",
    value: "stripe",
    valueType: "STRING",
    isSensitive: false
  },
  {
    key: "secrets.session_secret",
    label: "Session Secret",
    description: "Sensitive runtime secret status. Actual value is never displayed.",
    category: "Secrets",
    value: "configured_in_environment",
    valueType: "SECRET",
    isSensitive: true
  }
];

async function ensureDefaultSettings(): Promise<void> {
  await Promise.all(
    defaultPlatformSettings.map((setting) =>
      prisma.platformSetting.upsert({
        where: {
          key: setting.key
        },
        update: {
          label: setting.label,
          description: setting.description,
          category: setting.category,
          valueType: setting.valueType,
          isSensitive: setting.isSensitive
        },
        create: {
          key: setting.key,
          label: setting.label,
          description: setting.description,
          category: setting.category,
          value: setting.value,
          valueType: setting.valueType,
          isSensitive: setting.isSensitive
        }
      })
    )
  );
}

function maskSettingValue(setting: AdminPlatformSetting): string {
  if (!setting.isSensitive) {
    return setting.value;
  }

  return "••••••••••••";
}

function groupSettingsByCategory(
  settings: readonly AdminPlatformSetting[]
): readonly AdminSettingsCategory[] {
  const groupedSettings = new Map<string, AdminPlatformSetting[]>();

  for (const setting of settings) {
    const categorySettings = groupedSettings.get(setting.category) ?? [];
    categorySettings.push({
      ...setting,
      value: maskSettingValue(setting)
    });
    groupedSettings.set(setting.category, categorySettings);
  }

  return Array.from(groupedSettings.entries())
    .map(
      ([category, categorySettings]): AdminSettingsCategory => ({
        category,
        settings: categorySettings
      })
    )
    .sort((first, second): number => first.category.localeCompare(second.category));
}

export async function getAdminSettingsData(): Promise<AdminSettingsData> {
  await ensureDefaultSettings();

  const settings = await prisma.platformSetting.findMany({
    orderBy: [
      {
        category: "asc"
      },
      {
        key: "asc"
      }
    ],
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

  const sensitiveSettings = settings.filter((setting): boolean => setting.isSensitive);

  return {
    totalSettings: settings.length,
    sensitiveSettings: sensitiveSettings.length,
    categories: groupSettingsByCategory(settings)
  };
}
