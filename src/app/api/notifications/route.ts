import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  listUserNotifications,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from "@/lib/services/notification.service";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const [notifications, unreadCount] = await Promise.all([
      listUserNotifications(user.id),
      getUnreadNotificationCount(user.id),
    ]);

    return NextResponse.json(
      { success: true, notifications, unreadCount },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to load notifications.");
  }
}

export async function PATCH() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    await markAllNotificationsAsRead(user.id);
    return NextResponse.json(
      { success: true, message: "All notifications marked as read." },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to mark notifications as read.");
  }
}
