"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OrderResponse } from "@/types/order";
import { formatMoney } from "@/lib/utils/money";
import { useToast } from "@/features/toast/toast-context";
import { Package, Truck, CheckCircle2, Clock, ChevronDown, ChevronUp, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [buyingAgain, setBuyingAgain] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.status === 401) {
          router.push("/login?callbackUrl=/orders");
          return;
        }
        const data = await res.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      } catch (err: any) {
        showToast(err.message || "Failed to load orders.", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [router, showToast]);

  const toggleDetails = (id: string) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBuyAgain = async (productId: string, variantId?: string | null) => {
    setBuyingAgain(productId);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          variantId: variantId || null,
          quantity: 1,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add to cart");
      }
      showToast("Added back to your cart!");
      router.push("/cart");
    } catch (err: any) {
      showToast(err.message || "Could not reorder product", "error");
    } finally {
      setBuyingAgain(null);
    }
  };

  // Metrics
  const totalOrdersCount = orders.length;
  const inProgressCount = orders.filter(
    (o) => o.status === "PROCESSING" || o.status === "SHIPPED" || o.status === "PENDING"
  ).length;

  const totalSpentFormatted = orders.length > 0
    ? orders[0]?.currency === "INR"
      ? `₹${orders.reduce((acc, o) => acc + Number(o.total.amount), 0).toFixed(2)}`
      : `$${orders.reduce((acc, o) => acc + Number(o.total.amount), 0).toFixed(2)}`
    : "₹0.00";

  return (
    <main className="min-h-screen bg-black text-white">
      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-black/80 px-6 py-5 backdrop-blur-xl lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/home" className="text-2xl font-bold">
            Influ<span className="text-fuchsia-400">store</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-neutral-400 md:flex">
            <Link href="/home" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/explore" className="transition hover:text-white">
              Explore
            </Link>
            <Link href="/products" className="transition hover:text-white">
              Shop
            </Link>
            <Link href="/orders" className="text-white font-medium">
              Orders
            </Link>
            <Link href="/profile" className="transition hover:text-white">
              Profile
            </Link>
          </div>

          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Cart</span>
          </Link>
        </div>
      </nav>

      {/* CONTENT */}
      <section className="px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="mb-12">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-fuchsia-400">
              Your purchases
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              My Orders
            </h1>
            <p className="mt-4 max-w-xl text-neutral-400 text-sm">
              Track your purchases, review receipts, and manage your Influ-Store orders in one place.
            </p>
          </div>

          {/* SUMMARY CARDS */}
          <div className="mb-12 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <p className="text-sm text-neutral-400">Total orders</p>
              <p className="mt-3 text-3xl font-bold">{totalOrdersCount}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <p className="text-sm text-neutral-400">In progress</p>
              <p className="mt-3 text-3xl font-bold text-yellow-400">{inProgressCount}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <p className="text-sm text-neutral-400">Total spent</p>
              <p className="mt-3 text-3xl font-bold text-fuchsia-400">{totalSpentFormatted}</p>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
              <p className="text-sm text-neutral-400">Loading your orders...</p>
            </div>
          )}

          {/* EMPTY ORDERS STATE */}
          {!loading && orders.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-neutral-400">
                <Package className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-2xl font-bold">No orders placed yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-400">
                You haven&apos;t placed any orders yet. Discover trending products recommended by top creators and treat yourself!
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105"
              >
                <span>Browse Products</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* ORDERS LIST */}
          {!loading && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => {
                const isExpanded = !!expandedOrders[order.id];
                const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                let statusBadgeColor = "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
                let statusLabel = "Processing";
                let progressWidth = "w-1/3";

                if (order.status === "DELIVERED") {
                  statusBadgeColor = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
                  statusLabel = "Delivered";
                  progressWidth = "w-full";
                } else if (order.status === "SHIPPED") {
                  statusBadgeColor = "text-blue-400 bg-blue-400/10 border-blue-400/20";
                  statusLabel = "Shipped";
                  progressWidth = "w-2/3";
                } else if (order.status === "CANCELLED") {
                  statusBadgeColor = "text-red-400 bg-red-400/10 border-red-400/20";
                  statusLabel = "Cancelled";
                  progressWidth = "w-0";
                }

                return (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:border-white/20 backdrop-blur-xl"
                  >
                    {/* ORDER HEADER */}
                    <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Order ID</p>
                        <p className="mt-1 font-mono font-semibold text-white">{order.orderNumber}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Placed on</p>
                        <p className="mt-1 text-sm text-neutral-300">{dateStr}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Total Amount</p>
                        <p className="mt-1 font-bold text-fuchsia-400">{formatMoney(order.total)}</p>
                      </div>

                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeColor}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* ORDER ITEMS */}
                    <div className="divide-y divide-white/10 p-6">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex flex-col gap-6 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-900 border border-white/10">
                            {item.coverImageUrl ? (
                              <img
                                src={item.coverImageUrl}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-neutral-500">
                                <Package className="h-8 w-8" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {item.category && (
                              <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                                {item.category}
                              </p>
                            )}

                            <Link
                              href={`/product/${item.productSlug}`}
                              className="mt-1 block text-lg font-semibold text-white hover:text-fuchsia-400 transition"
                            >
                              {item.productName}
                            </Link>

                            {item.optionSummary && (
                              <p className="mt-0.5 text-xs text-fuchsia-400">
                                {item.optionSummary}
                              </p>
                            )}

                            <p className="mt-2 text-sm text-neutral-400">
                              Quantity: <span className="text-white font-medium">{item.quantity}</span> • Unit: {formatMoney(item.price)}
                            </p>

                            <p className="mt-2 text-base font-semibold text-white">
                              {formatMoney(item.total)}
                            </p>
                          </div>

                          <div className="flex flex-row sm:flex-col gap-2 sm:min-w-[140px]">
                            <button
                              type="button"
                              onClick={() => handleBuyAgain(item.productId, item.variantId)}
                              disabled={buyingAgain === item.productId}
                              className="flex-1 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-50"
                            >
                              {buyingAgain === item.productId ? "Adding..." : "Buy Again"}
                            </button>

                            <Link
                              href={`/product/${item.productSlug}`}
                              className="flex-1 text-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-neutral-300 transition hover:bg-white/10"
                            >
                              View Product
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* PROGRESS BAR */}
                    {order.status !== "CANCELLED" && (
                      <div className="border-t border-white/10 px-6 py-5 bg-black/20">
                        <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
                          <span className={order.status === "PENDING" || order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED" ? "text-fuchsia-400" : ""}>
                            Ordered
                          </span>
                          <span className={order.status === "SHIPPED" || order.status === "DELIVERED" ? "text-fuchsia-400" : ""}>
                            Shipped
                          </span>
                          <span className={order.status === "DELIVERED" ? "text-emerald-400 font-semibold" : ""}>
                            Delivered
                          </span>
                        </div>

                        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${progressWidth} bg-gradient-to-r from-fuchsia-500 via-pink-500 to-emerald-400 transition-all duration-500`}
                          />
                        </div>
                      </div>
                    )}

                    {/* TOGGLE DETAILS */}
                    <div className="border-t border-white/10 px-6 py-3 flex items-center justify-between text-xs text-neutral-400">
                      <span>Payment: <strong className="text-white capitalize">{order.paymentMethod}</strong> ({order.paymentStatus})</span>
                      <button
                        type="button"
                        onClick={() => toggleDetails(order.id)}
                        className="flex items-center gap-1 font-semibold text-fuchsia-400 hover:text-fuchsia-300 transition py-1"
                      >
                        {isExpanded ? (
                          <>
                            <span>Hide Details</span>
                            <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <span>Order Summary & Address</span>
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* EXPANDABLE ORDER BREAKDOWN */}
                    {isExpanded && (
                      <div className="border-t border-white/10 bg-black/40 p-6 text-sm grid gap-6 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Shipping Destination</p>
                          <p className="font-semibold text-white">{order.fullName}</p>
                          <p className="text-neutral-400 mt-1">{order.addressLine1}</p>
                          {order.addressLine2 && <p className="text-neutral-400">{order.addressLine2}</p>}
                          <p className="text-neutral-400">{order.city}, {order.state} - {order.postalCode}</p>
                          <p className="text-neutral-400">{order.country}</p>
                          {order.phone && <p className="text-neutral-500 text-xs mt-2">📞 {order.phone}</p>}
                        </div>

                        <div className="space-y-2 border-t border-white/10 pt-4 sm:border-t-0 sm:pt-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Price Breakdown</p>
                          <div className="flex justify-between text-neutral-400">
                            <span>Subtotal</span>
                            <span className="text-white">{formatMoney(order.subtotal)}</span>
                          </div>
                          {Number(order.discount.amount) > 0 && (
                            <div className="flex justify-between text-neutral-400">
                              <span>Discount</span>
                              <span className="text-emerald-400">-{formatMoney(order.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-neutral-400">
                            <span>Shipping</span>
                            <span>{Number(order.shippingFee.amount) === 0 ? <strong className="text-emerald-400">FREE</strong> : formatMoney(order.shippingFee)}</span>
                          </div>
                          <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-base text-white">
                            <span>Total</span>
                            <span className="text-fuchsia-400">{formatMoney(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* EXPLORE MORE CALLOUT */}
          <div className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-600/10 via-purple-600/5 to-orange-400/10 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl">
              ✨
            </div>

            <h2 className="mt-5 text-2xl font-bold">Looking for something new?</h2>

            <p className="mx-auto mt-3 max-w-md text-sm text-neutral-400">
              Discover curated products recommended by creators and find your next favorite style piece.
            </p>

            <Link
              href="/explore"
              className="mt-7 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:scale-105"
            >
              Explore Products →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row">
          <div>
            <span className="text-xl font-bold">
              Influ<span className="text-fuchsia-400">store</span>
            </span>
            <p className="mt-2 text-sm text-neutral-500">
              Discover. Influence. Shop.
            </p>
          </div>

          <p className="text-sm text-neutral-600">
            © 2026 Influstore. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}