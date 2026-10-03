import { z } from "zod";

export const userSettingsUpdateSchema = z.object({
  inAppNotifications: z.boolean().optional(),
  emailUpdates: z.boolean().optional(),
  privateProfile: z.boolean().optional(),
});

export type UserSettingsUpdateInput = z.infer<typeof userSettingsUpdateSchema>;
