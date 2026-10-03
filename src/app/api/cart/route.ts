import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handle-error";
import { UnauthorizedError } from "@/lib/errors";
import { addToCart, clearCart, getCart } from "@/lib/services/cart.service";
import { addToCartSchema } from "@/lib/validations/cart.schema";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const cart = await getCart(user.id);
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    return handleApiError(error, "Failed to fetch cart.");
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const body = await request.json();
    const parsed = addToCartSchema.parse(body);

    const cart = await addToCart(user.id, parsed);
    return NextResponse.json({ success: true, message: "Added to cart", cart });
  } catch (error) {
    return handleApiError(error, "Failed to add to cart.");
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const cart = await clearCart(user.id);
    return NextResponse.json({ success: true, message: "Cart cleared", cart });
  } catch (error) {
    return handleApiError(error, "Failed to clear cart.");
  }
}
