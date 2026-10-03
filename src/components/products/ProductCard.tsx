"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Package } from "lucide-react";
import { formatMoney } from "@/lib/utils/money";
import { PRODUCT_CATEGORY_LABELS, ProductCategoryValue } from "@/lib/constants/product";
import { ProductListItem } from "@/types/product";
import { useAuth } from "@/features/auth/auth-context";
import { useToast } from "@/features/toast/toast-context";
import { cn } from "@/lib/utils/cn";

export function ProductCard({ product }: { product: ProductListItem }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  const outOfStock = product.totalStock <= 0;

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast("Please log in to save to wishlist", "error");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      if (inWishlist) {
        const res = await fetch(`/api/wishlist/${product.id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
        setInWishlist(false);
        showToast("Removed from wishlist");
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
        setInWishlist(true);
        showToast("Saved to wishlist!");
      }
    } catch (err: any) {
      showToast(err.message || "Could not update wishlist", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900">
        {product.coverImageUrl ? (
          <img
            src={product.coverImageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <Package className="h-8 w-8" />
          </div>
        )}

        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
        {product.compareAtPrice && !outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-fuchsia-500 px-3 py-1 text-xs font-semibold text-white">
            Sale
          </span>
        )}

        {/* WISHLIST TOGGLE BUTTON */}
        <button
          type="button"
          disabled={loading}
          onClick={toggleWishlist}
          aria-label="Wishlist toggle"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/80"
        >
          <Heart className={cn("h-4 w-4", inWishlist && "fill-pink-500 text-pink-500")} />
        </button>
      </div>

      <div className="pt-3">
        <p className="text-xs uppercase tracking-wider text-neutral-500">
          {PRODUCT_CATEGORY_LABELS[product.category as ProductCategoryValue]}
        </p>
        <h3 className="mt-1 truncate text-sm font-semibold text-neutral-900 dark:text-white transition group-hover:text-fuchsia-500">
          {product.name}
        </h3>
        <p className="mt-0.5 truncate text-xs text-neutral-500">by {product.seller.storeName}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            {formatMoney(product.basePrice)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-neutral-400 line-through">{formatMoney(product.compareAtPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
