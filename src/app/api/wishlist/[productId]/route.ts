import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handle-error";
import { UnauthorizedError } from "@/lib/errors";
import { checkWishlistStatus, moveToCart, removeFromWishlist } from "@/lib/services/wishlist.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: true, inWishlist: false });

    const { productId } = await params;
    const status = await checkWishlistStatus(user.id, productId);
    return NextResponse.json({ success: true, ...status });
  } catch (error) {
    return handleApiError(error, "Failed to check wishlist status.");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { productId } = await params;
    const result = await removeFromWishlist(user.id, productId);
    return NextResponse.json({ success: true, message: "Removed from wishlist", ...result });
  } catch (error) {
    return handleApiError(error, "Failed to remove from wishlist.");
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { productId } = await params;
    const body = await request.json().catch(() => ({}));

    const wishlist = await moveToCart(user.id, productId, body.variantId);
    return NextResponse.json({ success: true, message: "Moved to cart", wishlist });
  } catch (error) {
    return handleApiError(error, "Failed to move product to cart.");
  }
}
