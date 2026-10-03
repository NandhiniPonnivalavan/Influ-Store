import { Money } from "@/lib/utils/money";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export interface OrderItemResponse {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  productSlug: string;
  coverImageUrl: string | null;
  category: string | null;
  variantSku: string | null;
  optionSummary: string | null;
  price: Money;
  quantity: number;
  total: Money;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: Money;
  discount: Money;
  shippingFee: Money;
  total: Money;
  currency: string;
  fullName: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
}

export interface CreateOrderInput {
  fullName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  paymentMethod: "CARD" | "UPI" | "COD";
  promoCode?: string;
}
