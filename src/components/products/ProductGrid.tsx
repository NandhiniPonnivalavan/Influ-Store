"use client";

import React, { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductListItem } from "@/types/product";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  /** Cursor-paginated GET endpoint — e.g. "/api/products?sellerSlug=..." */
  fetchBaseUrl: string;
  initialProducts: ProductListItem[];
  initialCursor: string | null;
  emptyMessage: string;
  /**
   * Extracts { products, nextCursor } from the endpoint's JSON response.
   * Defaults to the flat { products, nextCursor } shape most endpoints
   * return; pass a custom extractor for endpoints with a different shape
   * (e.g. /api/search nests results under `results.products`).
   */
  extractResponse?: (data: unknown) => { products: ProductListItem[]; nextCursor: string | null };
}

function defaultExtractResponse(data: unknown): { products: ProductListItem[]; nextCursor: string | null } {
  const typed = data as { products?: ProductListItem[]; nextCursor?: string | null };
  return { products: typed.products ?? [], nextCursor: typed.nextCursor ?? null };
}

/** Simple infinite-load product grid — used on store pages and the profile Store tab. See ShopPageClient for the filterable marketplace variant. */
export function ProductGrid({
  fetchBaseUrl,
  initialProducts,
  initialCursor,
  emptyMessage,
  extractResponse = defaultExtractResponse,
}: ProductGridProps) {
  const [products, setProducts] = useState(initialProducts);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const separator = fetchBaseUrl.includes("?") ? "&" : "?";
      const res = await fetch(`${fetchBaseUrl}${separator}cursor=${encodeURIComponent(cursor)}`);
      const data = await res.json();
      if (!res.ok || !(data as { success?: boolean }).success) throw new Error();
      const { products: nextProducts, nextCursor } = extractResponse(data);
      setProducts((current) => [...current, ...nextProducts]);
      setCursor(nextCursor);
    } catch {
      // Button stays visible so the user can retry.
    } finally {
      setLoading(false);
    }
  }

  if (products.length === 0) {
    return (
      <div className="relative mx-auto max-w-md space-y-4 py-20 text-center">
        <div className="mx-auto relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-neutral-900/60 shadow-xl backdrop-blur-xl">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-fuchsia-500/20 to-transparent blur-md" />
          <ShoppingBag className="relative h-8 w-8 text-neutral-400" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">No products yet</h3>
          <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {cursor && (
        <div className="mt-8 flex justify-center">
          <Button type="button" variant="outline" size="sm" isLoading={loading} onClick={loadMore}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
