import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handle-error";
import { UnauthorizedError } from "@/lib/errors";
import { createOrderFromCart } from "@/lib/services/order.service";
import { checkoutSchema } from "@/lib/validations/order.schema";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const body = await request.json();
    const parsed = checkoutSchema.parse(body);

    const order = await createOrderFromCart(user.id, parsed);

    return NextResponse.json({
      success: true,
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    return handleApiError(error, "Failed to place order.");
  }
}
