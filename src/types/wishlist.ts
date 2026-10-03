import { Money } from "@/lib/utils/money";

export interface WishlistItemResponse {
  id: string;
  productId: string;
  name: string;
  slug: string;
  category: string;
  basePrice: Money;
  compareAtPrice: Money | null;
  coverImageUrl: string | null;
  totalStock: number;
  storeName: string;
  storeSlug: string;
  createdAt: string | Date;
}
