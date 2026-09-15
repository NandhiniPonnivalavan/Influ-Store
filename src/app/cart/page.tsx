"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { useAuth } from "@/features/auth/auth-context";
import { useToast } from "@/features/toast/toast-context";
import { formatMoney } from "@/lib/utils/money";
import { CartItemResponse, CartSummary } from "@/types/cart";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function fetchCart() {
      setLoading(true);
      try {
        const res = await fetch("/api/cart");
        const data = await res.json();
        if (res.ok && data.success) {
          setCart(data.cart);
        }
      } catch {
        showToast("Failed to load cart", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchCart();
  }, [isAuthenticated, authLoading]);

  async function handleUpdateQuantity(cartItemId: string, newQuantity: number) {
    setUpdatingId(cartItemId);
    try {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setCart(data.cart);
    } catch (err: any) {
      showToast(err.message || "Failed to update quantity", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRemoveItem(cartItemId: string) {
    setUpdatingId(cartItemId);
    try {
      const res = await fetch(`/api/cart/${cartItemId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setCart(data.cart);
      showToast("Item removed from cart");
    } catch (err: any) {
      showToast(err.message || "Failed to remove item", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleClearCart() {
    try {
      const res = await fetch("/api/cart", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setCart(data.cart);
      showToast("Cart cleared");
    } catch (err: any) {
      showToast(err.message || "Failed to clear cart", "error");
    }
  }

  function applyPromo() {
    if (promo.trim().toUpperCase() === "INFLU10") {
      setPromoApplied(true);
      showToast("Promo code INFLU10 applied! 10% discount added.");
    } else {
      showToast("Invalid promo code", "error");
    }
  }

  const items = cart?.items ?? [];
  const subtotalNum = cart ? Number(cart.subtotal.amount) : 0;
  const currency = cart?.subtotal.currency || "INR";
  const discountNum = promoApplied ? subtotalNum * 0.1 : 0;
  const totalNum = subtotalNum - discountNum;

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-black text-white pt-24 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-10 w-48 bg-neutral-800 rounded-xl animate-pulse" />
          <div className="h-64 bg-neutral-900 rounded-3xl animate-pulse" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white pt-28 px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center py-20 rounded-[32px] border border-white/10 bg-white/[0.03]">
          <ShoppingBag className="mx-auto h-16 w-16 text-fuchsia-400" />
          <h1 className="mt-6 text-3xl font-bold">Log in to view your cart</h1>
          <p className="mt-3 text-neutral-400">
            Sign in to access your saved items and shop products from top creators.
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
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-400">
              Your bag
            </p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
              Shopping Cart
            </h1>
            <p className="mt-2 text-neutral-400">
              {items.length === 0
                ? "Your cart is currently empty."
                : `${cart?.totalItems} ${cart?.totalItems === 1 ? "item" : "items"} in your cart`}
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs text-neutral-500 hover:text-red-400 transition"
            >
              Clear cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* EMPTY CART */
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] px-6 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-fuchsia-500/10 text-4xl">
              🛍️
            </div>
            <h2 className="mt-6 text-2xl font-semibold">Your cart is empty</h2>
            <p className="mx-auto mt-3 max-w-md text-neutral-400">
              Discover products from your favorite creators and add something you love to your cart.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-block rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105"
            >
              Explore Products →
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            {/* CART ITEMS LIST */}
            <div className="space-y-4">
              {items.map((item) => {
                const optionsString = Object.entries(item.optionValues)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" | ");

                return (
                  <div
                    key={item.id}
                    className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20"
                  >
                    <div className="flex gap-5">
                      {/* IMAGE */}
                      <Link href={`/product/${item.productSlug}`} className="h-32 w-28 shrink-0 overflow-hidden rounded-2xl bg-neutral-900 sm:h-36 sm:w-32">
                        {item.coverImageUrl ? (
                          <img
                            src={item.coverImageUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-neutral-500">
                            <ShoppingBag className="h-8 w-8" />
                          </div>
                        )}
                      </Link>

                      {/* DETAILS */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-fuchsia-400">
                            {item.category}
                          </p>
                          <Link href={`/product/${item.productSlug}`} className="mt-1 block truncate text-lg font-semibold sm:text-xl hover:text-fuchsia-400 transition">
                            {item.productName}
                          </Link>
                          <p className="mt-0.5 text-xs text-neutral-400">
                            by {item.storeName}
                          </p>
                          {optionsString && (
                            <p className="mt-1 text-xs font-medium text-neutral-300">
                              {optionsString}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-neutral-400">
                            {formatMoney(item.unitPrice)} each
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-3 mt-3">
                          {/* QUANTITY */}
                          <div className="flex items-center rounded-full border border-white/10 bg-black">
                            <button
                              disabled={updatingId === item.id}
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="flex h-9 w-9 items-center justify-center text-neutral-400 transition hover:text-white disabled:opacity-40"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              disabled={updatingId === item.id || item.quantity >= item.availableStock}
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="flex h-9 w-9 items-center justify-center text-neutral-400 transition hover:text-white disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>

                          {/* REMOVE */}
                          <button
                            disabled={updatingId === item.id}
                            onClick={() => handleRemoveItem(item.id)}
                            className="flex items-center gap-1 text-xs text-neutral-500 transition hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                      </div>

                      {/* ITEM TOTAL PRICE */}
                      <div className="hidden text-right sm:block">
                        <p className="text-lg font-semibold">
                          {formatMoney(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ORDER SUMMARY */}
            <div className="h-fit rounded-[32px] border border-white/10 bg-white/[0.04] p-7 lg:sticky lg:top-28">
              <h2 className="text-2xl font-semibold">Order Summary</h2>

              {/* PROMO */}
              <div className="mt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Promo Code
                </p>
                <div className="flex gap-2">
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="e.g. INFLU10"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/50"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> INFLU10 applied — 10% off
                  </p>
                )}
              </div>

              {/* PRICES */}
              <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="font-semibold">{formatMoney({ amount: subtotalNum.toFixed(2), currency })}</span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Discount (10%)</span>
                    <span className="text-emerald-400 font-semibold">
                      -{formatMoney({ amount: discountNum.toFixed(2), currency })}
                    </span>
                  </div>
                )}

                <div className="border-t border-white/10 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold">
                      {formatMoney({ amount: totalNum.toFixed(2), currency })}
                    </span>
                  </div>
                </div>
              </div>

              {/* CHECKOUT BUTTON */}
              <Link
                href="/checkout"
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 px-5 py-4 font-semibold text-white transition hover:scale-[1.01] shadow-lg shadow-fuchsia-500/20"
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Link>

              <p className="mt-4 text-center text-xs text-neutral-500 flex items-center justify-center gap-1">
                <ShieldCheck className="h-4 w-4 text-fuchsia-400" /> Secure checkout • Verified sellers
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}