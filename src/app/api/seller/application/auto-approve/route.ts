import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { handleApiError } from "@/lib/api/handle-error";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const application = await prisma.sellerApplication.findUnique({
      where: { userId: user.id },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: "No application found to approve." },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.sellerApplication.update({
        where: { id: application.id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          rejectionReason: null,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { role: "SELLER" },
      }),
    ]);

    return NextResponse.json(
      { success: true, message: "Seller account approved!" },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to approve seller application.");
  }
}
