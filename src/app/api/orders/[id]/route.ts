import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handle-error";
import { UnauthorizedError } from "@/lib/errors";
import { getOrderById } from "@/lib/services/order.service";

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { id } = await props.params;
    const order = await getOrderById(user.id, id);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch order.");
  }
}
