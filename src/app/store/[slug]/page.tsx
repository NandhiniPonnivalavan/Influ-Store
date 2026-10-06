import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Store as StoreIcon, PackagePlus, Settings, Sparkles, ShoppingBag, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/products/ProductGrid";
import { getStoreBySlug } from "@/lib/services/seller-profile.service";
import { listProducts } from "@/lib/services/product.service";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StorePageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) {
    return { title: "Store not found | Influ-Store" };
  }
  return {
    title: `${store.storeName} | Influ-Store`,
    description: store.description || `Shop ${store.storeName} on Influ-Store.`,
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.username === store.seller.username;

  const productsPage = await listProducts({ sellerSlug: slug });

  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-white selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
      <Navbar />

      <div className="flex-1 pt-20">
        {/* BANNER / HERO */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-neutral-900 border-b border-white/10">
          {store.bannerUrl ? (
            <>
              <img
                src={store.bannerUrl}
                alt=""
                className="h-full w-full object-cover object-center transform scale-105 filter brightness-90 transition-transform duration-700 hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
            </>
          ) : (
            <div className="h-full w-full bg-gradient-to-tr from-fuchsia-950/40 via-purple-900/20 to-neutral-950 flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.15),transparent_70%)]" />
              <StoreIcon className="h-20 w-20 text-neutral-800 animate-pulse" />
            </div>
          )}
        </div>

        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          {/* STORE HEADER CARD */}
          <div className="relative -mt-20 sm:-mt-24 z-10 mb-8 rounded-3xl border border-white/10 bg-neutral-900/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-black/80">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* LOGO */}
                <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-2 border-white/20 bg-neutral-950 shadow-2xl ring-4 ring-neutral-950/80">
                  {store.logoUrl ? (
                    <img src={store.logoUrl} alt={store.storeName} className="h-full w-full object-cover" />
                  ) : (
                    <StoreIcon className="h-10 w-10 text-neutral-600" />
                  )}
                </div>

                {/* DETAILS */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      {store.storeName}
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2.5 py-0.5 text-xs font-semibold text-fuchsia-400">
                      <ShieldCheck className="h-3 w-3" /> Verified Store
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-neutral-400">
                    <Link
                      href={`/profile/${store.seller.username}`}
                      className="hover:text-white transition flex items-center gap-1 text-neutral-300 font-medium"
                    >
                      by @{store.seller.username}
                    </Link>
                    <span>•</span>
                    <span className="text-neutral-300">
                      <strong className="text-white font-semibold">{store.productCount}</strong> {store.productCount === 1 ? "product" : "products"}
                    </span>
                    {store.website && (
                      <>
                        <span>•</span>
                        <a
                          href={store.website.startsWith("http") ? store.website : `https://${store.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-fuchsia-400 hover:text-fuchsia-300 hover:underline transition"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Website
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-0">
                {isOwner ? (
                  <>
                    <Link
                      href="/seller/products/new"
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-600/25 transition hover:brightness-110 active:scale-95"
                    >
                      <PackagePlus className="h-4 w-4" /> Upload Product
                    </Link>
                    <Link
                      href="/seller/store"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-neutral-200 transition hover:bg-white/10 hover:text-white"
                    >
                      <Settings className="h-4 w-4 text-neutral-400" /> Customize Store
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/profile/${store.seller.username}`}
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-neutral-200 transition hover:bg-white/10 hover:text-white"
                  >
                    View profile
                  </Link>
                )}
              </div>
            </div>

            {store.description && (
              <p className="mt-5 max-w-3xl text-sm leading-relaxed text-neutral-300 border-t border-white/5 pt-4">
                {store.description}
              </p>
            )}
          </div>

          {/* PRODUCTS SECTION */}
          <div className="pb-20">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-fuchsia-500" /> Products
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">Explore items from {store.storeName}</p>
              </div>

              {isOwner && store.productCount > 0 && (
                <Link
                  href="/seller/products/new"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-fuchsia-400 hover:text-fuchsia-300 transition"
                >
                  <PackagePlus className="h-4 w-4" /> Add another
                </Link>
              )}
            </div>

            <ProductGrid
              fetchBaseUrl={`/api/products?sellerSlug=${encodeURIComponent(slug)}`}
              initialProducts={productsPage.items}
              initialCursor={productsPage.nextCursor}
              emptyMessage={
                isOwner
                  ? "Your store is live! Click 'Upload Product' above to list your first item."
                  : "This store hasn't listed any products yet. Check back soon!"
              }
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
