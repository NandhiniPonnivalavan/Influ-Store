import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  markNotificationAsRead,
  deleteNotification,
} from "@/lib/services/notification.service";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    await markNotificationAsRead(user.id, id);

    return NextResponse.json(
      { success: true, message: "Notification marked as read." },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to update notification.");
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    await deleteNotification(user.id, id);

    return NextResponse.json(
      { success: true, message: "Notification deleted." },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to delete notification.");
  }
}
