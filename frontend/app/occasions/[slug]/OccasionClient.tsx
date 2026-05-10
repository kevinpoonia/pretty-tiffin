'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { useCurrency } from '@/context/CurrencyContext';
import { Loader2, Gift, Sparkles, Star, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const OCCASIONS: Record<string, any> = {
  'corporate-gifts': {
    title: 'Corporate Gifting Solutions',
    description: 'Elevate your brand with personalized, high-end stainless steel tiffins and artisanal gift sets. Perfect for employees, clients, and partners.',
    icon: Gift,
    query: 'tiffin'
  },
  'wedding-favors': {
    title: 'Exquisite Wedding Favors',
    description: 'Make your special day unforgettable with handcrafted, laser-engraved gifts that your guests will cherish forever.',
    icon: Sparkles,
    query: 'gift'
  },
  'anniversary-specials': {
    title: 'Timeless Anniversary Gifts',
    description: 'Celebrate love and longevity with personalized pieces that blend tradition with modern luxury.',
    icon: Star,
    query: 'luxury'
  },
  'luxury-essentials': {
    title: 'Luxury Lifestyle Essentials',
    description: 'A curated collection of our most premium, artisanal kitchenware and lifestyle products.',
    icon: ShieldCheck,
    query: ''
  }
};

export default function OccasionClient({ slug }: { slug: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();
  const occasion = OCCASIONS[slug] || OCCASIONS['luxury-essentials'];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/products`);
        const data = await res.json();
        const allProducts = Array.isArray(data) ? data : (data.products || []);
        
        // Filter based on query or category
        let filtered = allProducts;
        if (occasion.query) {
          filtered = allProducts.filter((p: any) => 
            p.name.toLowerCase().includes(occasion.query) || 
            p.description.toLowerCase().includes(occasion.query) ||
            p.category?.toLowerCase().includes(occasion.query)
          );
        }
        
        setProducts(filtered.slice(0, 8));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug, occasion.query]);

  return (
    <>
      <Navbar alwaysSolid />
      <main className="min-h-screen bg-white pt-32 pb-20">
        {/* Hero Section */}
        <div className="bg-brand-50/50 py-20 border-b border-brand-100 mb-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-500 text-white mb-6">
              <occasion.icon size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-heading uppercase tracking-tighter text-stone-900 mb-6">{occasion.title}</h1>
            <p className="max-w-2xl mx-auto text-lg text-stone-600 leading-relaxed">{occasion.description}</p>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-heading italic text-stone-800">Curated Collection</h2>
            <div className="text-[10px] font-black uppercase tracking-widest text-brand-400">
              {products.length} Items Found
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-brand-500 mb-4" size={40} />
              <p className="text-stone-400 uppercase tracking-widest text-xs font-bold">Curating the best for you...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-brand-50 rounded-3xl border border-dashed border-brand-200">
              <Gift size={48} className="mx-auto text-brand-200 mb-4" />
              <p className="text-stone-500 font-medium">No products found in this category yet.</p>
              <Link href="/shop" className="text-brand-500 font-bold mt-4 inline-block hover:underline">Explore Full Shop</Link>
            </div>
          )}

          {/* Value Propositions */}
          <div className="mt-32 grid md:grid-cols-3 gap-12 border-t border-brand-100 pt-20">
            <div className="text-center">
              <h3 className="font-heading italic text-xl text-stone-800 mb-4">Artisanal Craftsmanship</h3>
              <p className="text-sm text-stone-600 leading-relaxed">Each piece is hand-selected and precision-engraved by master artisans to ensure a premium feel.</p>
            </div>
            <div className="text-center">
              <h3 className="font-heading italic text-xl text-stone-800 mb-4">Bespoke Personalization</h3>
              <p className="text-sm text-stone-600 leading-relaxed">Add names, dates, or corporate logos to create a truly unique gift that leaves a lasting impression.</p>
            </div>
            <div className="text-center">
              <h3 className="font-heading italic text-xl text-stone-800 mb-4">Premium Packaging</h3>
              <p className="text-sm text-stone-600 leading-relaxed">All our products arrive in boutique-style packaging, ready to be gifted immediately.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
