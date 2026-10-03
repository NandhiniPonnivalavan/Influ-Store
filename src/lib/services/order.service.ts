import { prisma } from "@/lib/db/prisma";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import { toMoney } from "@/lib/utils/money";
import { CreateOrderInput, OrderResponse } from "@/types/order";
import { getCart } from "./cart.service";
import { PaymentMethod, PaymentStatus, OrderStatus, ProductCategory } from "@prisma/client";

function generateOrderNumber(): string {
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  const year = new Date().getFullYear();
  return `INF-${year}-${randomPart}`;
}

function serializeOrder(order: any): OrderResponse {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    subtotal: toMoney(order.subtotal, order.currency),
    discount: toMoney(order.discount, order.currency),
    shippingFee: toMoney(order.shippingFee, order.currency),
    total: toMoney(order.total, order.currency),
    currency: order.currency,
    fullName: order.fullName,
    phone: order.phone,
    addressLine1: order.addressLine1,
    addressLine2: order.addressLine2,
    city: order.city,
    state: order.state,
    postalCode: order.postalCode,
    country: order.country,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
    updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
    items: (order.items || []).map((item: any) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      productSlug: item.productSlug,
      coverImageUrl: item.coverImageUrl,
      category: item.category,
      variantSku: item.variantSku,
      optionSummary: item.optionSummary,
      price: toMoney(item.price, order.currency),
      quantity: item.quantity,
      total: toMoney(item.total, order.currency),
    })),
  };
}

export async function createOrderFromCart(
  userId: string,
  input: CreateOrderInput
): Promise<OrderResponse> {
  const cart = await getCart(userId);

  if (!cart.items || cart.items.length === 0) {
    throw new BadRequestError("Your cart is empty. Add products before checking out.");
  }

  // Calculate pricing
  const subtotalNum = Number(cart.subtotal.amount);
  const currency = cart.subtotal.currency || "INR";

  let discountNum = 0;
  if (input.promoCode && input.promoCode.trim().toUpperCase() === "INFLU10") {
    discountNum = Math.round(subtotalNum * 0.1);
  }

  // Free shipping over ₹1000, else ₹100 (or $150 / $10 if USD)
  const isINR = currency === "INR";
  const shippingThreshold = isINR ? 1000 : 150;
  const standardShipping = isINR ? 100 : 10;
  const shippingFeeNum = subtotalNum >= shippingThreshold ? 0 : standardShipping;

  const totalNum = Math.max(0, subtotalNum - discountNum + shippingFeeNum);

  const paymentMethodEnum: PaymentMethod =
    input.paymentMethod === "UPI"
      ? PaymentMethod.UPI
      : input.paymentMethod === "COD"
      ? PaymentMethod.COD
      : PaymentMethod.CARD;

  // In demo flow, CARD/UPI are marked as PAID, COD is PENDING payment
  const paymentStatusEnum: PaymentStatus =
    paymentMethodEnum === PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.PAID;

  const orderNumber = generateOrderNumber();

  // Create order & order items and clear cart in a single transaction
  const createdOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        status: OrderStatus.PROCESSING,
        paymentMethod: paymentMethodEnum,
        paymentStatus: paymentStatusEnum,
        subtotal: subtotalNum,
        discount: discountNum,
        shippingFee: shippingFeeNum,
        total: totalNum,
        currency,
        fullName: input.fullName.trim(),
        phone: input.phone?.trim() || null,
        addressLine1: input.addressLine1.trim(),
        addressLine2: input.addressLine2?.trim() || null,
        city: input.city.trim(),
        state: input.state.trim(),
        postalCode: input.postalCode.trim(),
        country: input.country?.trim() || "India",
        items: {
          create: cart.items.map((item) => {
            const optionSummary = Object.entries(item.optionValues)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ");

            return {
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              productSlug: item.productSlug,
              coverImageUrl: item.coverImageUrl,
              category: (item.category as ProductCategory) || null,
              variantSku: item.variantSku,
              optionSummary: optionSummary || null,
              price: Number(item.unitPrice.amount),
              quantity: item.quantity,
              total: Number(item.totalPrice.amount),
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    // Clear the user's cart
    await tx.cartItem.deleteMany({
      where: { userId },
    });

    return order;
  });

  return serializeOrder(createdOrder);
}

export async function getUserOrders(userId: string): Promise<OrderResponse[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  return orders.map(serializeOrder);
}

export async function getOrderById(userId: string, orderId: string): Promise<OrderResponse> {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new NotFoundError("Order not found.");
  }

  return serializeOrder(order);
}
