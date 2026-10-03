import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handle-error";
import { UnauthorizedError } from "@/lib/errors";
import { getUserOrders } from "@/lib/services/order.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const orders = await getUserOrders(user.id);

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch orders.");
  }
}
