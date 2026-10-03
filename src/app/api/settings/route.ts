import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserSettings, updateUserSettings } from "@/lib/services/settings.service";
import { userSettingsUpdateSchema } from "@/lib/validations/settings.schema";
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

    const settings = await getUserSettings(user.id);
    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to retrieve account settings.");
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const json = await request.json();
    const data = userSettingsUpdateSchema.parse(json);

    const settings = await updateUserSettings(user.id, data);
    return NextResponse.json(
      { success: true, message: "Preferences saved successfully.", settings },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to save account settings.");
  }
}
