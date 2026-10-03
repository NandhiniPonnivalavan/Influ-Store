import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getStorageService } from "@/lib/storage";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants/post";
import { handleApiError } from "@/lib/api/handle-error";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No image file provided." },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as never)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported image format. Allowed: JPG, PNG, WebP, GIF",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: `Image must be ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB or smaller.`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorageService();
    const result = await storage.uploadFile(buffer, file.name, {
      folder: `avatars/${user.id}`,
      contentType: file.type,
    });

    // Automatically update the user profile in database
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        avatarUrl: result.url,
        avatarKey: result.key,
      },
      create: {
        userId: user.id,
        displayName: user.username,
        avatarUrl: result.url,
        avatarKey: result.key,
      },
    });

    return NextResponse.json(
      { success: true, url: result.url, key: result.key },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to upload avatar image.");
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    await prisma.profile.updateMany({
      where: { userId: user.id },
      data: {
        avatarUrl: null,
        avatarKey: null,
      },
    });

    return NextResponse.json(
      { success: true, message: "Profile photo removed." },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to remove avatar image.");
  }
}
