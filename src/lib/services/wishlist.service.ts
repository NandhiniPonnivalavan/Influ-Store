import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors";
import { toMoney } from "@/lib/utils/money";
import { WishlistItemResponse } from "@/types/wishlist";
import { addToCart } from "./cart.service";

export async function getWishlist(userId: string): Promise<WishlistItemResponse[]> {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          media: { orderBy: { order: "asc" }, take: 1 },
          sellerProfile: { select: { storeName: true, slug: true } },
        },
      },
    },
  });

  return items.map((item: any) => {
    const p = item.product;
    return {
      id: item.id,
      productId: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      basePrice: toMoney(p.basePrice, p.currency),
      compareAtPrice: p.compareAtPrice ? toMoney(p.compareAtPrice, p.currency) : null,
      coverImageUrl: p.media[0]?.mediaUrl ?? null,
      totalStock: p.totalStock,
      storeName: p.sellerProfile.storeName,
      storeSlug: p.sellerProfile.slug,
      createdAt: item.createdAt,
    };
  });
}

export async function addToWishlist(
  userId: string,
  productId: string
): Promise<{ inWishlist: boolean }> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) throw new NotFoundError("Product not found.");

  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  });

  return { inWishlist: true };
}

export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<{ inWishlist: boolean }> {
  await prisma.wishlistItem.deleteMany({
    where: { userId, productId },
  });
  return { inWishlist: false };
}

export async function checkWishlistStatus(
  userId: string,
  productId: string
): Promise<{ inWishlist: boolean }> {
  const item = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  return { inWishlist: !!item };
}

export async function moveToCart(
  userId: string,
  productId: string,
  variantId?: string | null
) {
  await addToCart(userId, { productId, variantId, quantity: 1 });
  await removeFromWishlist(userId, productId);
  return getWishlist(userId);
}
