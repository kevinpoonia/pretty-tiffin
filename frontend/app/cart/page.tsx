'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Gift, ChevronRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export default function CartPage() {
  const { items, total, loading, removeItem, updateQuantity } = useCart();
  const { showToast } = useToast();

  const handleRemove = async (id: string, name: string) => {
    await removeItem(id);
    showToast(`${name} removed from cart`, 'info');
  };

  if (loading) {
    return (
      <div className="bg-[#fdfaf6] min-h-screen flex flex-col">
        <Navbar alwaysSolid />
        <main className="flex-1 flex flex-col justify-center items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-brand-200 border-t-brand-900 animate-spin" />
          <p className="text-stone-500 font-heading italic text-lg">Gathering your treasures...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#fdfaf6] min-h-screen selection:bg-brand-200">
      <Navbar alwaysSolid />
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-16">

        <h1 className="text-4xl md:text-5xl font-heading italic text-stone-800 mb-10">
          Your Collection <span className="text-stone-400 text-xl font-sans not-italic ml-2">({items.length} {items.length === 1 ? 'treasure' : 'treasures'})</span>
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-[3rem] organic-shape-1 shadow-2xl border border-brand-50 p-12 md:p-24 text-center">
            <div className="w-24 h-24 organic-shape-2 bg-brand-50 flex items-center justify-center mx-auto mb-8">
              <ShoppingBag size={40} className="text-brand-300" />
            </div>
            <h2 className="text-3xl font-heading italic text-stone-800 mb-4">Your circle is empty</h2>
            <p className="text-stone-500 italic mb-10 text-lg">Every artisanal piece starts with a single choice. Begin yours today.</p>
            <Link
              href="/shop"
              className="inline-block bg-brand-900 hover:bg-stone-800 text-white font-bold py-4 px-12 rounded-full transition-all duration-500 shadow-xl hover:scale-105 active:scale-95 tracking-widest text-xs uppercase"
            >
              Discover Collections
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Cart Items */}
            <div className="flex-1 space-y-6">
              {items.map((item, idx) => (
                <div
                  key={`${item.id || item.productId}-${idx}`}
                  className="bg-white rounded-[2rem] organic-shape-1 p-6 flex gap-6 shadow-xl border border-brand-50 hover:shadow-2xl transition-all duration-700 group"
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 organic-shape-2 bg-brand-50 flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform duration-1000">
                    <Image
                      src={item.imageUrl || '/images/product-1.png'}
                      alt={item.name}
                      fill
                      sizes="128px"
                      className="object-contain p-3"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-heading italic text-xl sm:text-2xl text-stone-800 leading-tight group-hover:text-brand-700 transition-colors">{item.name}</h3>
                      <p className="font-sans font-bold text-stone-900 text-lg sm:text-xl">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>

                    {item.customization && Object.keys(item.customization).length > 0 && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
                        {Object.entries(item.customization).map(([key, value]) =>
                          value ? (
                            <p key={key} className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                              {key}: <span className="text-stone-600">{String(value)}</span>
                            </p>
                          ) : null
                        )}
                      </div>
                    )}

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center bg-brand-50/50 rounded-full border border-brand-100 overflow-hidden h-10">
                        <button
                          onClick={() => updateQuantity(item.id!, Math.max(1, item.quantity - 1))}
                          className="px-4 h-full font-bold text-stone-500 hover:text-brand-900 transition-colors"
                        >
                          −
                        </button>
                        <span className="px-3 h-full flex items-center justify-center text-sm font-bold text-stone-800 min-w-[2rem]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                          className="px-4 h-full font-bold text-stone-500 hover:text-brand-900 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id!, item.name)}
                        className="text-stone-300 hover:text-red-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-6">
                <Link href="/shop" className="text-brand-600 font-bold text-xs uppercase tracking-widest hover:text-brand-900 border-b-2 border-brand-100 pb-1 transition-all">
                  ← Continue Exploring
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[24rem] flex-shrink-0 space-y-6">
              <Link
                href="/gift"
                className="bg-brand-50/50 border border-brand-100 rounded-[2rem] p-6 flex items-center gap-4 hover:shadow-2xl transition-all duration-700 group"
              >
                <div className="w-12 h-12 organic-shape-2 bg-white flex items-center justify-center text-brand-500 shadow-xl group-hover:scale-110 transition-transform">
                  <Gift size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading italic text-lg text-stone-800">Add a touch of magic</p>
                  <p className="text-xs text-stone-400 font-medium">Message cards & artisanal wrapping</p>
                </div>
                <ChevronRight size={20} className="text-brand-300 group-hover:translate-x-2 transition-transform" />
              </Link>

              <div className="bg-white rounded-[2.5rem] organic-shape-1 shadow-2xl border border-brand-50 p-8 xl:sticky xl:top-32">
                <h2 className="font-heading italic text-2xl text-stone-800 mb-6 pb-4 border-b border-brand-50">Summary</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm text-stone-500 font-medium">
                    <span>Treasures ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                    <span className="text-stone-800">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-500 font-medium">
                    <span>Artisanal Shipping</span>
                    <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Complimentary</span>
                  </div>
                  <div className="flex justify-between font-sans font-bold text-xl text-stone-900 border-t border-brand-50 pt-4 mt-4">
                    <span>Total Amount</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-brand-900 hover:bg-stone-800 text-white font-bold py-5 px-6 rounded-full transition-all duration-700 flex justify-center text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95"
                >
                  Proceed to Checkout
                </Link>

                <p className="text-[10px] text-center text-stone-400 mt-6 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  🔒 Secured & Encrypted
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
