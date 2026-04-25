import { Suspense } from 'react';
import { Metadata } from 'next';
import ShopClient from './ShopClient';

async function getProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/products`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Failed to fetch products:", e);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Shop Premium Tiffins | Pretty Luxe Atelier',
  description: 'Browse our collection of premium, customizable stainless steel stickers and tiffin boxes. Perfect for personal use and gifting.',
};

function ShopPageFallback() {
  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="h-8 w-44 rounded-full bg-white shadow-sm animate-pulse mb-6" />
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="hidden lg:block rounded-3xl bg-white p-6 shadow-sm">
            <div className="h-5 w-24 rounded-full bg-gray-100 animate-pulse mb-5" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-11 rounded-2xl bg-gray-50 animate-pulse" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="rounded-3xl bg-white p-4 shadow-sm">
                <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse mb-4" />
                <div className="h-4 rounded-full bg-gray-100 animate-pulse mb-3" />
                <div className="h-4 w-2/3 rounded-full bg-gray-100 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <Suspense fallback={<ShopPageFallback />}>
      <ShopClient initialProducts={products} />
    </Suspense>
  );
}
