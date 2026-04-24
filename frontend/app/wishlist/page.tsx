'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    category: string;
  };
}

export default function WishlistPage() {
  const { token, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!token) { setLoading(false); return; }
    api.get('/user/wishlist')
      .then(r => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, authLoading]);

  const remove = async (productId: string) => {
    setRemoving(productId);
    try {
      await api.delete(`/user/wishlist/${productId}`);
      setItems(prev => prev.filter(i => i.productId !== productId));
      showToast('Removed from wishlist', 'info');
    } catch {
      showToast('Failed to remove item', 'error');
    } finally {
      setRemoving(null);
    }
  };

  const moveToCart = async (item: WishlistItem) => {
    await addItem({
      productId: item.product.id,
      quantity: 1,
      price: Number(item.product.price),
      name: item.product.name,
      imageUrl: item.product.images?.[0] || '',
      customization: {},
    });
    showToast(`${item.product.name} added to cart!`, 'success');
  };

  return (
    <div className="bg-[#faf8f4] min-h-screen flex flex-col">
      <Navbar alwaysSolid />
      <main className="flex-1 pt-28 md:pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 font-heading">My Wishlist</h1>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin text-brand-400" />
            </div>
          )}

          {!loading && !token && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="bg-brand-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-100">
                <Heart size={36} className="text-brand-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Sign in to see your wishlist</h2>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">Log in to save your favourite products and access them anywhere.</p>
              <Link href="/login" className="inline-block bg-brand-500 text-white px-10 py-3 rounded-full font-bold hover:bg-brand-600 transition-colors">
                Log In
              </Link>
            </div>
          )}

          {!loading && token && items.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-brand-50 p-8 rounded-full mb-6 border border-brand-100 w-fit mx-auto"
              >
                <Heart size={48} className="text-brand-400" />
              </motion.div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Add your favourite personalized tiffins and gifts to your wishlist to keep track of them for later.
              </p>
              <Link href="/shop" className="inline-block bg-brand-500 text-white px-10 py-3 rounded-full font-bold hover:bg-brand-600 transition-colors flex items-center justify-center gap-2 w-fit mx-auto">
                <ShoppingBag size={18} /> Browse Shop
              </Link>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group"
                  >
                    <Link href={`/shop/${item.product.slug}`} className="block relative aspect-square bg-brand-50 overflow-hidden">
                      {item.product.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain p-6 group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={40} className="text-brand-200" />
                        </div>
                      )}
                    </Link>
                    <div className="p-5">
                      <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-1">{item.product.category}</p>
                      <Link href={`/shop/${item.product.slug}`}>
                        <h3 className="font-heading italic text-lg text-stone-800 mb-3 hover:text-brand-700 transition-colors line-clamp-2">{item.product.name}</h3>
                      </Link>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="font-bold text-stone-900">₹{Number(item.product.price).toLocaleString('en-IN')}</span>
                        {item.product.compareAtPrice && Number(item.product.compareAtPrice) > Number(item.product.price) && (
                          <span className="text-sm text-stone-400 line-through">₹{Number(item.product.compareAtPrice).toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => moveToCart(item)}
                          className="flex-1 bg-brand-900 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                        >
                          <ShoppingBag size={15} /> Add to Cart
                        </button>
                        <button
                          onClick={() => remove(item.productId)}
                          disabled={removing === item.productId}
                          className="w-10 h-10 flex items-center justify-center rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                          aria-label="Remove from wishlist"
                        >
                          {removing === item.productId ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
