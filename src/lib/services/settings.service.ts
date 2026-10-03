import { prisma } from "@/lib/db/prisma";

export interface UserSettingsDTO {
  inAppNotifications: boolean;
  emailUpdates: boolean;
  privateProfile: boolean;
}

export async function getUserSettings(userId: string): Promise<UserSettingsDTO> {
  const settings = await (prisma as any).userSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    return {
      inAppNotifications: true,
      emailUpdates: false,
      privateProfile: false,
    };
  }

  return {
    inAppNotifications: settings.inAppNotifications,
    emailUpdates: settings.emailUpdates,
    privateProfile: settings.privateProfile,
  };
}

export async function updateUserSettings(
  userId: string,
  data: Partial<UserSettingsDTO>
): Promise<UserSettingsDTO> {
  const updated = await (prisma as any).userSettings.upsert({
    where: { userId },
    update: {
      inAppNotifications: data.inAppNotifications,
      emailUpdates: data.emailUpdates,
      privateProfile: data.privateProfile,
    },
    create: {
      userId,
      inAppNotifications: data.inAppNotifications ?? true,
      emailUpdates: data.emailUpdates ?? false,
      privateProfile: data.privateProfile ?? false,
    },
  });

  return {
    inAppNotifications: updated.inAppNotifications,
    emailUpdates: updated.emailUpdates,
    privateProfile: updated.privateProfile,
  };
}
