import { Money } from "@/lib/utils/money";
import { VariantOptionValueMap } from "@/types/product";

export interface CartItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  coverImageUrl: string | null;
  category: string;
  variantId: string | null;
  variantSku: string | null;
  optionValues: VariantOptionValueMap;
  unitPrice: Money;
  totalPrice: Money;
  quantity: number;
  availableStock: number;
  isOutOfStock: boolean;
  storeName: string;
  storeSlug: string;
}

export interface CartSummary {
  items: CartItemResponse[];
  totalItems: number;
  subtotal: Money;
}
