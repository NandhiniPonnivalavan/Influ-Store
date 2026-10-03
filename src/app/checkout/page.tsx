"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CartSummary } from "@/types/cart";
import { OrderResponse } from "@/types/order";
import { formatMoney } from "@/lib/utils/money";
import { useToast } from "@/features/toast/toast-context";
import { ShieldCheck, Truck, RotateCcw, Lock, ArrowRight, Loader2, Package } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");

  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const [placedOrder, setPlacedOrder] = useState<OrderResponse | null>(null);

  // Fetch real cart on load
  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await fetch("/api/cart");
        if (res.status === 401) {
          router.push("/login?callbackUrl=/checkout");
          return;
        }
        const data = await res.json();
        if (data.success && data.cart) {
          setCart(data.cart);
        }
      } catch (err: any) {
        showToast(err.message || "Failed to load cart", "error");
      } finally {
        setLoadingCart(false);
      }
    }

    // Also prefill user email/name from session if available
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (data.success && data.user) {
          if (data.user.email) setEmail(data.user.email);
          if (data.user.profile?.displayName) {
            const parts = data.user.profile.displayName.split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
          }
        }
      } catch {
        // Ignored
      }
    }

    fetchCart();
    fetchProfile();
  }, [router, showToast]);

  const subtotalNum = cart ? Number(cart.subtotal.amount) : 0;
  const currency = cart?.subtotal.currency || "INR";
  const isINR = currency === "INR";

  const discountNum = promoApplied ? Math.round(subtotalNum * 0.1) : 0;
  const shippingThreshold = isINR ? 1000 : 150;
  const standardShipping = isINR ? 100 : 10;
  const shippingNum = subtotalNum >= shippingThreshold || subtotalNum === 0 ? 0 : standardShipping;
  const totalNum = Math.max(0, subtotalNum - discountNum + shippingNum);

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === "INFLU10") {
      setPromoApplied(true);
      showToast("10% discount applied!");
    } else {
      showToast("Invalid promo code. Try 'INFLU10'", "error");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!cart || cart.items.length === 0) {
      showToast("Your cart is empty.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: `${firstName} ${lastName}`.trim() || firstName || "Valued Customer",
          phone: phone || undefined,
          addressLine1: address,
          addressLine2: apartment || undefined,
          city,
          state,
          postalCode: zip,
          country: "India",
          paymentMethod: paymentMethod.toUpperCase(),
          promoCode: promoApplied ? "INFLU10" : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to place order.");
      }

      setPlacedOrder(data.order);
      showToast("Order placed successfully! 🎉");
    } catch (err: any) {
      showToast(err.message || "Something went wrong while placing your order.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS / CONFIRMATION SCREEN
  if (placedOrder) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white py-12">
        <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-white/[0.04] p-8 sm:p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-4xl">
            ✓
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-400">
            Order Confirmed
          </p>

          <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Thank you for shopping!
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-neutral-400">
            Your order has been successfully placed with our verified sellers. You can view progress and tracking updates anytime in your orders.
          </p>

          <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-black/50 p-5 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Order ID</span>
              <span className="font-semibold text-white font-mono">{placedOrder.orderNumber}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">Payment</span>
              <span className="font-medium text-neutral-300 capitalize">{placedOrder.paymentMethod} • {placedOrder.paymentStatus}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">Delivery to</span>
              <span className="font-medium text-neutral-300 truncate max-w-[200px]">
                {placedOrder.city}, {placedOrder.postalCode}
              </span>
            </div>

            <div className="border-t border-white/10 pt-3 flex justify-between text-base">
              <span className="font-semibold text-white">Total</span>
              <span className="font-bold text-fuchsia-400">
                {formatMoney(placedOrder.total)}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/orders"
              className="flex-1 rounded-2xl bg-white px-5 py-4 font-semibold text-black transition hover:bg-neutral-200"
            >
              View My Orders
            </Link>

            <Link
              href="/explore"
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-semibold text-white transition hover:bg-white/10"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // LOADING STATE
  if (loadingCart) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
          <p className="text-sm text-neutral-400">Preparing checkout...</p>
        </div>
      </main>
    );
  }

  // EMPTY CART STATE
  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white">
        <header className="border-b border-white/10 px-6 py-5 lg:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              Influ<span className="text-fuchsia-400">store</span>
            </Link>
            <Link href="/cart" className="text-sm text-neutral-400 transition hover:text-white">
              ← Back to Cart
            </Link>
          </div>
        </header>

        <section className="flex flex-col items-center justify-center px-6 py-28 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-3xl text-fuchsia-400">
            <Package className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">Your cart is empty</h1>
          <p className="mt-3 max-w-md text-sm text-neutral-400">
            Looks like you haven&apos;t added any items to your cart yet. Explore creators and curated collections to find pieces you love.
          </p>
          <Link
            href="/products"
            className="mt-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            Explore Storefronts
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 px-6 py-5 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Influ<span className="text-fuchsia-400">store</span>
          </Link>

          <Link href="/cart" className="text-sm text-neutral-400 transition hover:text-white">
            ← Back to Cart
          </Link>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <section className="px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          {/* TITLE */}
          <div className="mb-12">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-fuchsia-400">
              Secure Checkout
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Complete your order.
            </h1>

            <p className="mt-4 text-sm text-neutral-400">
              Enter your shipping details and select your preferred payment method.
            </p>
          </div>

          <form onSubmit={handlePlaceOrder}>
            <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
              {/* LEFT SIDE - FORMS */}
              <div className="space-y-8">
                {/* 01: CONTACT INFORMATION */}
                <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-7 sm:p-8">
                  <div className="mb-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-400">
                      01
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">Contact information</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      We&apos;ll use this to send order status updates.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="mb-2 block text-sm font-medium text-neutral-300">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-neutral-600 focus:border-fuchsia-400/50"
                      />
                    </div>

                    <div>
                      <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-neutral-300">
                        First name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-neutral-600 focus:border-fuchsia-400/50"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-neutral-300">
                        Last name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-neutral-600 focus:border-fuchsia-400/50"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="phone" className="mb-2 block text-sm font-medium text-neutral-300">
                        Phone number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-neutral-600 focus:border-fuchsia-400/50"
                      />
                    </div>
                  </div>
                </section>

                {/* 02: SHIPPING ADDRESS */}
                <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-7 sm:p-8">
                  <div className="mb-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-400">
                      02
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">Shipping address</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Where should our verified seller ship your package?
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label htmlFor="address" className="mb-2 block text-sm font-medium text-neutral-300">
                        Street address
                      </label>
                      <input
                        id="address"
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Flat / House number, Street, Area"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-neutral-600 focus:border-fuchsia-400/50"
                      />
                    </div>

                    <div>
                      <label htmlFor="apartment" className="mb-2 block text-sm font-medium text-neutral-300">
                        Apartment, landmark, suite <span className="text-neutral-600 font-normal">(Optional)</span>
                      </label>
                      <input
                        id="apartment"
                        type="text"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder="Near city center, Floor 3"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-neutral-600 focus:border-fuchsia-400/50"
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-3">
                      <div>
                        <label htmlFor="city" className="mb-2 block text-sm font-medium text-neutral-300">
                          City
                        </label>
                        <input
                          id="city"
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Mumbai"
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/50"
                        />
                      </div>

                      <div>
                        <label htmlFor="state" className="mb-2 block text-sm font-medium text-neutral-300">
                          State
                        </label>
                        <input
                          id="state"
                          type="text"
                          required
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="e.g. Maharashtra"
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/50"
                        />
                      </div>

                      <div>
                        <label htmlFor="zip" className="mb-2 block text-sm font-medium text-neutral-300">
                          Postal code
                        </label>
                        <input
                          id="zip"
                          type="text"
                          required
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          placeholder="e.g. 400001"
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/50"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* 03: PAYMENT METHOD */}
                <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-7 sm:p-8">
                  <div className="mb-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-400">
                      03
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">Payment method</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Select how you want to pay. Transactions are securely encrypted.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* CARD */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`w-full rounded-2xl border p-5 text-left transition ${
                        paymentMethod === "card"
                          ? "border-fuchsia-400/50 bg-fuchsia-400/10"
                          : "border-white/10 bg-black/30 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
                          💳
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Credit / Debit Card</p>
                          <p className="mt-0.5 text-xs text-neutral-400">Visa, Mastercard, RuPay</p>
                        </div>
                        <div
                          className={`h-5 w-5 rounded-full border ${
                            paymentMethod === "card"
                              ? "border-fuchsia-400 bg-fuchsia-400"
                              : "border-white/20"
                          }`}
                        />
                      </div>
                    </button>

                    {/* UPI */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`w-full rounded-2xl border p-5 text-left transition ${
                        paymentMethod === "upi"
                          ? "border-fuchsia-400/50 bg-fuchsia-400/10"
                          : "border-white/10 bg-black/30 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
                          📱
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Instant UPI</p>
                          <p className="mt-0.5 text-xs text-neutral-400">Google Pay, PhonePe, Paytm, BHIM</p>
                        </div>
                        <div
                          className={`h-5 w-5 rounded-full border ${
                            paymentMethod === "upi"
                              ? "border-fuchsia-400 bg-fuchsia-400"
                              : "border-white/20"
                          }`}
                        />
                      </div>
                    </button>

                    {/* COD */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`w-full rounded-2xl border p-5 text-left transition ${
                        paymentMethod === "cod"
                          ? "border-fuchsia-400/50 bg-fuchsia-400/10"
                          : "border-white/10 bg-black/30 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
                          💵
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Cash on Delivery</p>
                          <p className="mt-0.5 text-xs text-neutral-400">Pay cash or UPI upon delivery</p>
                        </div>
                        <div
                          className={`h-5 w-5 rounded-full border ${
                            paymentMethod === "cod"
                              ? "border-fuchsia-400 bg-fuchsia-400"
                              : "border-white/20"
                          }`}
                        />
                      </div>
                    </button>
                  </div>

                  {/* CARD FIELDS */}
                  {paymentMethod === "card" && (
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="cardNumber" className="mb-2 block text-sm font-medium text-neutral-300">
                          Card number
                        </label>
                        <input
                          id="cardNumber"
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 •••• •••• 4242"
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/50"
                        />
                      </div>

                      <div>
                        <label htmlFor="expiry" className="mb-2 block text-sm font-medium text-neutral-300">
                          Expiry date
                        </label>
                        <input
                          id="expiry"
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM / YY"
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/50"
                        />
                      </div>

                      <div>
                        <label htmlFor="cvv" className="mb-2 block text-sm font-medium text-neutral-300">
                          CVV
                        </label>
                        <input
                          id="cvv"
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/50"
                        />
                      </div>
                    </div>
                  )}

                  {/* UPI FIELDS */}
                  {paymentMethod === "upi" && (
                    <div className="mt-6">
                      <label htmlFor="upi" className="mb-2 block text-sm font-medium text-neutral-300">
                        UPI ID / VPA
                      </label>
                      <input
                        id="upi"
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okaxis"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/50"
                      />
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/5 p-4 text-sm text-neutral-300">
                      💡 Cash on Delivery is enabled for this delivery pincode. Please have exact change or UPI ready at the time of delivery.
                    </div>
                  )}
                </section>
              </div>

              {/* RIGHT SIDE - ORDER SUMMARY */}
              <aside className="h-fit lg:sticky lg:top-8">
                <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
                  <h2 className="text-2xl font-semibold">Your order</h2>

                  {/* REAL CART ITEMS */}
                  <div className="mt-6 divide-y divide-white/10">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="relative h-18 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-900 border border-white/10">
                          {item.coverImageUrl ? (
                            <img
                              src={item.coverImageUrl}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-500">
                              <Package className="h-6 w-6" />
                            </div>
                          )}

                          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-fuchsia-500 text-[10px] font-bold text-white shadow">
                            {item.quantity}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{item.productName}</p>
                          <p className="text-xs text-neutral-400 mt-0.5 capitalize">{item.category}</p>
                          {Object.entries(item.optionValues).length > 0 && (
                            <p className="text-xs text-fuchsia-400 mt-0.5">
                              {Object.entries(item.optionValues)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" • ")}
                            </p>
                          )}
                        </div>

                        <p className="text-sm font-semibold text-white">
                          {formatMoney(item.totalPrice)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* PROMO CODE */}
                  <div className="mt-6 border-t border-white/10 pt-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Promo code
                    </p>

                    <div className="flex gap-2">
                      <input
                        value={promo}
                        onChange={(e) => setPromo(e.target.value)}
                        placeholder="Try 'INFLU10'"
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/50"
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
                      <p className="mt-2 text-xs text-emerald-400 font-medium">
                        ✓ 10% discount applied!
                      </p>
                    )}
                  </div>

                  {/* PRICING BREAKDOWN */}
                  <div className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm">
                    <div className="flex justify-between text-neutral-400">
                      <span>Subtotal ({cart.totalItems} items)</span>
                      <span className="text-white">{formatMoney(cart.subtotal)}</span>
                    </div>

                    {promoApplied && (
                      <div className="flex justify-between text-neutral-400">
                        <span>Discount (10%)</span>
                        <span className="text-emerald-400 font-medium">
                          -{isINR ? `₹${discountNum.toFixed(2)}` : `$${discountNum.toFixed(2)}`}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-neutral-400">
                      <span>Shipping</span>
                      <span>
                        {shippingNum === 0 ? (
                          <span className="text-emerald-400 font-medium">FREE</span>
                        ) : (
                          <span className="text-white">
                            {isINR ? `₹${shippingNum.toFixed(2)}` : `$${shippingNum.toFixed(2)}`}
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-white">Total</span>
                        <span className="text-2xl font-bold text-white">
                          {isINR ? `₹${totalNum.toFixed(2)}` : `$${totalNum.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PLACE ORDER BUTTON */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 px-5 py-4 font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:opacity-95 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Placing your order...
                      </>
                    ) : (
                      <>
                        Place Order • {isINR ? `₹${totalNum.toFixed(2)}` : `$${totalNum.toFixed(2)}`}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
                    <Lock className="h-3.5 w-3.5" />
                    <span>256-bit encrypted checkout</span>
                  </div>
                </div>

                {/* TRUST BADGES */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
                    <ShieldCheck className="mx-auto h-5 w-5 text-fuchsia-400" />
                    <p className="mt-1 text-[11px] text-neutral-400 font-medium">Buyer Protection</p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
                    <Truck className="mx-auto h-5 w-5 text-fuchsia-400" />
                    <p className="mt-1 text-[11px] text-neutral-400 font-medium">Fast Dispatch</p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
                    <RotateCcw className="mx-auto h-5 w-5 text-fuchsia-400" />
                    <p className="mt-1 text-[11px] text-neutral-400 font-medium">Easy Returns</p>
                  </div>
                </div>
              </aside>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}