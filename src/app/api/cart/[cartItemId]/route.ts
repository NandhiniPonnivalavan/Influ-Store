import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handle-error";
import { UnauthorizedError } from "@/lib/errors";
import { removeCartItem, updateCartItemQuantity } from "@/lib/services/cart.service";
import { updateCartItemSchema } from "@/lib/validations/cart.schema";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ cartItemId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { cartItemId } = await params;
    const body = await request.json();
    const parsed = updateCartItemSchema.parse(body);

    const cart = await updateCartItemQuantity(user.id, cartItemId, parsed.quantity);
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    return handleApiError(error, "Failed to update cart item.");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ cartItemId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { cartItemId } = await params;
    const cart = await removeCartItem(user.id, cartItemId);
    return NextResponse.json({ success: true, message: "Item removed", cart });
  } catch (error) {
    return handleApiError(error, "Failed to remove item.");
  }
}
