import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handle-error";
import { UnauthorizedError } from "@/lib/errors";
import { addToWishlist, getWishlist } from "@/lib/services/wishlist.service";
import { addToWishlistSchema } from "@/lib/validations/wishlist.schema";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const wishlist = await getWishlist(user.id);
    return NextResponse.json({ success: true, wishlist });
  } catch (error) {
    return handleApiError(error, "Failed to fetch wishlist.");
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const body = await request.json();
    const parsed = addToWishlistSchema.parse(body);

    const result = await addToWishlist(user.id, parsed.productId);
    return NextResponse.json({ success: true, message: "Saved to wishlist", ...result });
  } catch (error) {
    return handleApiError(error, "Failed to update wishlist.");
  }
}
