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
  title: 'Shop Premium Tiffins | Pretty Tiffin',
  description: 'Browse our collection of premium, customizable stainless steel stickers and tiffin boxes. Perfect for personal use and gifting.',
};

export default async function ShopPage() {
  const products = await getProducts();

  return <ShopClient initialProducts={products} />;
}
