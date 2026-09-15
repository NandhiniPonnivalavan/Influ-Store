import { prisma } from "@/lib/db/prisma";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import { toMoney } from "@/lib/utils/money";
import { CartItemResponse, CartSummary } from "@/types/cart";
import { VariantOptionValueMap } from "@/types/product";

export async function getCart(userId: string): Promise<CartSummary> {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          media: { orderBy: { order: "asc" }, take: 1 },
          sellerProfile: { select: { storeName: true, slug: true } },
          variants: {
            include: {
              optionValues: {
                include: {
                  optionValue: {
                    include: { option: true },
                  },
                },
              },
            },
          },
        },
      },
      variant: {
        include: {
          optionValues: {
            include: {
              optionValue: {
                include: { option: true },
              },
            },
          },
        },
      },
    },
  });

  let totalItemsCount = 0;
  let totalSubtotalAmount = 0;
  const currency = items[0]?.product.currency || "INR";

  const serializedItems: CartItemResponse[] = items.map((item: any) => {
    const product = item.product;
    const coverImageUrl = product.media[0]?.mediaUrl ?? null;

    const variant =
      item.variant ??
      product.variants.find((v: any) => v.isDefault) ??
      product.variants[0];

    const availableStock = variant ? variant.stock : product.totalStock;
    const unitPriceNum = variant ? Number(variant.price) : Number(product.basePrice);
    const itemTotalPriceNum = unitPriceNum * item.quantity;

    totalItemsCount += item.quantity;
    totalSubtotalAmount += itemTotalPriceNum;

    const optionValues: VariantOptionValueMap = {};
    if (variant && variant.optionValues) {
      for (const join of variant.optionValues) {
        optionValues[join.optionValue.option.name] = join.optionValue.value;
      }
    }

    return {
      id: item.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      coverImageUrl,
      category: product.category,
      variantId: variant?.id ?? null,
      variantSku: variant?.sku ?? null,
      optionValues,
      unitPrice: toMoney(unitPriceNum, product.currency),
      totalPrice: toMoney(itemTotalPriceNum, product.currency),
      quantity: item.quantity,
      availableStock,
      isOutOfStock: availableStock <= 0,
      storeName: product.sellerProfile.storeName,
      storeSlug: product.sellerProfile.slug,
    };
  });

  return {
    items: serializedItems,
    totalItems: totalItemsCount,
    subtotal: toMoney(totalSubtotalAmount, currency),
  };
}

export async function addToCart(
  userId: string,
  params: { productId: string; variantId?: string | null; quantity: number }
): Promise<CartSummary> {
  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    include: { variants: true },
  });

  if (!product || product.status !== "ACTIVE") {
    throw new NotFoundError("Product not found or unavailable.");
  }

  let selectedVariantId = params.variantId ?? null;
  if (!selectedVariantId && product.variants.length > 0) {
    const defaultVar = product.variants.find((v: any) => v.isDefault) ?? product.variants[0];
    selectedVariantId = defaultVar.id;
  }

  const selectedVariant = product.variants.find((v: any) => v.id === selectedVariantId);
  const stockAvailable = selectedVariant ? selectedVariant.stock : product.totalStock;

  if (stockAvailable <= 0) {
    throw new BadRequestError("This product variant is currently out of stock.");
  }

  const existing = await prisma.cartItem.findFirst({
    where: {
      userId,
      productId: params.productId,
      variantId: selectedVariantId,
    },
  });

  const desiredQuantity = (existing?.quantity ?? 0) + params.quantity;
  if (desiredQuantity > stockAvailable) {
    throw new BadRequestError(
      `Cannot add more items than available stock (${stockAvailable} available).`
    );
  }

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: desiredQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        userId,
        productId: params.productId,
        variantId: selectedVariantId,
        quantity: Math.min(params.quantity, stockAvailable),
      },
    });
  }

  return getCart(userId);
}

export async function updateCartItemQuantity(
  userId: string,
  cartItemId: string,
  quantity: number
): Promise<CartSummary> {
  const existing = await prisma.cartItem.findFirst({
    where: { id: cartItemId, userId },
    include: { product: { include: { variants: true } } },
  });

  if (!existing) {
    throw new NotFoundError("Cart item not found.");
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return getCart(userId);
  }

  const selectedVariant = existing.product.variants.find((v: any) => v.id === existing.variantId);
  const stockAvailable = selectedVariant ? selectedVariant.stock : existing.product.totalStock;

  if (quantity > stockAvailable) {
    throw new BadRequestError(
      `Quantity cannot exceed available stock of ${stockAvailable}.`
    );
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  return getCart(userId);
}

export async function removeCartItem(
  userId: string,
  cartItemId: string
): Promise<CartSummary> {
  await prisma.cartItem.deleteMany({
    where: { id: cartItemId, userId },
  });
  return getCart(userId);
}

export async function clearCart(userId: string): Promise<CartSummary> {
  await prisma.cartItem.deleteMany({ where: { userId } });
  return getCart(userId);
}
