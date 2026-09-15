"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useAuth } from "@/features/auth/auth-context";
import { useToast } from "@/features/toast/toast-context";
import { formatMoney } from "@/lib/utils/money";
import { WishlistItemResponse } from "@/types/wishlist";
import { PRODUCT_CATEGORY_LABELS, ProductCategoryValue } from "@/lib/constants/product";

export default function WishlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [wishlist, setWishlist] = useState<WishlistItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function fetchWishlist() {
      setLoading(true);
      try {
        const res = await fetch("/api/wishlist");
        const data = await res.json();
        if (res.ok && data.success) {
          setWishlist(data.wishlist);
        }
      } catch {
        showToast("Failed to load wishlist", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, [isAuthenticated, authLoading]);

  async function handleRemove(productId: string) {
    setActionId(productId);
    try {
      const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setWishlist((current) => current.filter((item) => item.productId !== productId));
      showToast("Removed from wishlist");
    } catch (err: any) {
      showToast(err.message || "Failed to remove item", "error");
    } finally {
      setActionId(null);
    }
  }

  async function handleMoveToCart(productId: string) {
    setActionId(productId);
    try {
      const res = await fetch(`/api/wishlist/${productId}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setWishlist(data.wishlist);
      showToast("Moved item to cart!");
    } catch (err: any) {
      showToast(err.message || "Failed to move item to cart", "error");
    } finally {
      setActionId(null);
    }
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-black text-white pt-24 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-10 w-48 bg-neutral-800 rounded-xl animate-pulse" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-neutral-900 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white pt-28 px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center py-20 rounded-[32px] border border-white/10 bg-white/[0.03]">
          <Heart className="mx-auto h-16 w-16 text-pink-500" />
          <h1 className="mt-6 text-3xl font-bold">Log in to view your wishlist</h1>
          <p className="mt-3 text-neutral-400">
            Save items from your favorite creators and view them whenever you&apos;re ready.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3.5 font-semibold text-black transition hover:scale-105"
          >
            Log in →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-16 px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-400">
            Saved for later
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
            My Wishlist
          </h1>
          <p className="mt-2 text-neutral-400">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {wishlist.length === 0 ? (
          /* EMPTY WISHLIST */
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.03] px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-500/10 text-4xl text-pink-400">
              ♡
            </div>
            <h2 className="mt-6 text-2xl font-bold">Your wishlist is empty</h2>
            <p className="mt-3 max-w-md text-neutral-400">
              Save products you love and come back to them whenever you&apos;re ready to buy.
            </p>
            <Link
              href="/products"
              className="mt-8 rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105"
            >
              Discover Products →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {wishlist.map((item) => (
              <div key={item.id} className="group rounded-3xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 flex flex-col justify-between">
                <div>
                  {/* IMAGE */}
                  <div className="relative overflow-hidden rounded-2xl bg-neutral-900 aspect-[4/5]">
                    <Link href={`/product/${item.slug}`}>
                      {item.coverImageUrl ? (
                        <img
                          src={item.coverImageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-500">
                          <ShoppingBag className="h-8 w-8" />
                        </div>
                      )}
                    </Link>

                    {/* REMOVE BUTTON OVERLAY */}
                    <button
                      disabled={actionId === item.productId}
                      onClick={() => handleRemove(item.productId)}
                      aria-label="Remove from wishlist"
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-pink-400 backdrop-blur transition hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* INFO */}
                  <div className="pt-4">
                    <p className="text-xs uppercase tracking-wider text-fuchsia-400 font-medium">
                      {PRODUCT_CATEGORY_LABELS[item.category as ProductCategoryValue] || item.category}
                    </p>
                    <Link href={`/product/${item.slug}`} className="mt-1 block truncate text-base font-semibold text-white hover:text-fuchsia-400 transition">
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-neutral-400">by {item.storeName}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {formatMoney(item.basePrice)}
                      </span>
                      {item.compareAtPrice && (
                        <span className="text-xs text-neutral-500 line-through">
                          {formatMoney(item.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* MOVE TO CART */}
                <button
                  disabled={actionId === item.productId || item.totalStock <= 0}
                  onClick={() => handleMoveToCart(item.productId)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {item.totalStock <= 0 ? "Out of Stock" : "Move to Cart"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}