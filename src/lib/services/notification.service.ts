import { prisma } from "@/lib/db/prisma";

export interface NotificationDTO {
  id: string;
  type: "like" | "comment" | "follow" | "purchase" | "system";
  user: string;
  message: string;
  time: string;
  read: boolean;
  image?: string;
  linkUrl?: string;
  createdAt: string;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function createNotification(params: {
  userId: string;
  actorId?: string;
  type: "like" | "comment" | "follow" | "purchase" | "system";
  message: string;
  linkUrl?: string;
  imageUrl?: string;
}) {
  try {
    // Check if user has inAppNotifications turned on in settings
    const settingsRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT "inAppNotifications" FROM "user_settings" WHERE "userId" = $1 LIMIT 1`,
      params.userId
    );

    if (settingsRows.length > 0 && settingsRows[0].inAppNotifications === false) {
      return null;
    }

    const id = makeId();
    await prisma.$queryRawUnsafe(
      `INSERT INTO "notifications" ("id", "userId", "actorId", "type", "message", "read", "linkUrl", "imageUrl", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      id,
      params.userId,
      params.actorId ?? null,
      params.type,
      params.message,
      false,
      params.linkUrl ?? null,
      params.imageUrl ?? null
    );

    return { id, ...params, read: false };
  } catch (error) {
    console.error("[createNotification error]:", error);
    return null;
  }
}

export async function listUserNotifications(userId: string): Promise<NotificationDTO[]> {
  const records: any[] = await prisma.$queryRawUnsafe(
    `SELECT "id", "userId", "actorId", "type", "message", "read", "linkUrl", "imageUrl", "createdAt"
     FROM "notifications"
     WHERE "userId" = $1
     ORDER BY "createdAt" DESC
     LIMIT 50`,
    userId
  );

  return records.map((n: any) => {
    return {
      id: n.id,
      type: n.type as NotificationDTO["type"],
      user: n.type === "system" ? "InfluStore" : (n.message.split(" ")[0] || "User"),
      message: n.message,
      time: timeAgo(new Date(n.createdAt)),
      read: Boolean(n.read),
      image: n.imageUrl || undefined,
      linkUrl: n.linkUrl || undefined,
      createdAt: new Date(n.createdAt).toISOString(),
    };
  });
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  return prisma.$queryRawUnsafe(
    `UPDATE "notifications" SET "read" = true WHERE "id" = $1 AND "userId" = $2`,
    notificationId,
    userId
  );
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.$queryRawUnsafe(
    `UPDATE "notifications" SET "read" = true WHERE "userId" = $1 AND "read" = false`,
    userId
  );
}

export async function deleteNotification(userId: string, notificationId: string) {
  return prisma.$queryRawUnsafe(
    `DELETE FROM "notifications" WHERE "id" = $1 AND "userId" = $2`,
    notificationId,
    userId
  );
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const result: any[] = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int as count FROM "notifications" WHERE "userId" = $1 AND "read" = false`,
    userId
  );
  return result[0]?.count ?? 0;
}
