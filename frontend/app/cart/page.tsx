'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Gift, ChevronRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function CartPage() {
  const { items, total, loading, removeItem, updateQuantity } = useCart();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();

  const handleRemove = async (id: string, name: string) => {
    await removeItem(id);
    showToast(`${name} removed from cart`, 'info');
  };

  if (loading) {
    return (
      <div className="bg-brand-50 min-h-screen flex flex-col font-sans">
        <Navbar alwaysSolid />
        <main className="flex-1 flex flex-col justify-center items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-200 border-t-brand-500 animate-spin" />
          <p className="text-stone-500 font-heading text-lg uppercase tracking-tight">Gathering your treasures...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-brand-50 min-h-screen selection:bg-brand-200 font-sans">
      <Navbar alwaysSolid />
      <main className="container mx-auto px-4 md:px-6 pt-6 pb-12 md:pb-16">

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading text-stone-800 mb-6 sm:mb-10 uppercase tracking-tight">
          Your Collection <span className="text-stone-400 text-xs sm:text-sm font-sans font-bold ml-2 sm:ml-4 uppercase tracking-[0.15em]">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-none shadow-sm border border-brand-100 p-12 md:p-24 text-center">
            <div className="w-20 h-20 bg-brand-50 flex items-center justify-center mx-auto mb-8 border border-brand-100">
              <ShoppingBag size={32} className="text-brand-300" />
            </div>
            <h2 className="text-2xl font-heading text-stone-800 mb-4 uppercase tracking-tight">Your circle is empty</h2>
            <p className="text-stone-500 mb-10 text-[10px] font-bold uppercase tracking-widest">Every artisanal piece starts with a single choice. Begin yours today.</p>
            <Link
              href="/shop"
              className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 px-12 rounded-none transition-all duration-500 shadow-sm tracking-[0.2em] text-[10px] uppercase"
            >
              Discover Collections
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">

            {/* Cart Items */}
            <div className="flex-1 space-y-6">
              {items.map((item, idx) => (
                <div
                  key={`${item.id || item.productId}-${idx}`}
                  className="bg-white rounded-none p-4 sm:p-6 flex gap-4 sm:gap-6 shadow-sm border border-brand-100 hover:shadow-md transition-all duration-700 group"
                >
                  <div className="w-20 h-20 sm:w-28 sm:h-28 bg-brand-50 flex-shrink-0 relative border border-brand-100 group-hover:scale-105 transition-transform duration-1000">
                    <Image
                      src={item.imageUrl || '/images/product-1.png'}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 80px, 112px"
                      className="object-contain p-2 sm:p-3"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2">
                      <h3 className="font-heading text-base sm:text-xl text-stone-900 leading-tight group-hover:text-brand-500 transition-colors uppercase tracking-tight">{item.name}</h3>
                      <p className="font-sans font-bold text-stone-900 text-sm sm:text-base shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>

                    {item.customization && Object.keys(item.customization).length > 0 && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
                        {Object.entries(item.customization).map(([key, value]) =>
                          value ? (
                            <p key={key} className="text-[9px] font-bold text-brand-400 uppercase tracking-widest">
                              {key}: <span className="text-stone-600">{String(value)}</span>
                            </p>
                          ) : null
                        )}
                      </div>
                    )}

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center border border-brand-100 rounded-none bg-brand-50 overflow-hidden h-10">
                        <button
                          onClick={() => updateQuantity(item.id!, Math.max(1, item.quantity - 1))}
                          className="px-4 h-full font-bold text-stone-400 hover:text-brand-500 transition-colors"
                        >
                          −
                        </button>
                        <span className="px-3 h-full flex items-center justify-center text-xs font-bold text-stone-800 min-w-[2rem]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                          className="px-4 h-full font-bold text-stone-400 hover:text-brand-500 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id!, item.name)}
                        className="text-stone-300 hover:text-red-500 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all"
                      >
                        <Trash2 size={14} /> Remove Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-6">
                <Link href="/shop" className="text-brand-500 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-brand-700 border-b border-brand-200 pb-1 transition-all">
                  ← Continue Exploring
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[24rem] flex-shrink-0 space-y-6">
              <Link
                href="/gift"
                className="bg-white border border-brand-100 rounded-none p-6 flex items-center gap-4 hover:shadow-md transition-all duration-700 group"
              >
                <div className="w-12 h-12 rounded-none bg-brand-50 flex items-center justify-center text-brand-500 border border-brand-100 group-hover:scale-110 transition-transform">
                  <Gift size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-lg text-stone-800 uppercase tracking-tight">Gift Wrap</p>
                  <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">Message cards & premium wrapping</p>
                </div>
                <ChevronRight size={16} className="text-brand-200 group-hover:translate-x-2 transition-transform" />
              </Link>

              <div className="bg-white rounded-none shadow-sm border border-brand-100 p-8 xl:sticky xl:top-32">
                <h2 className="font-heading text-2xl text-stone-900 mb-6 pb-4 border-b border-brand-50 uppercase tracking-tight">Summary</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                    <span>Treasures ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                    <span className="text-stone-900">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                    <span>Shipping</span>
                    <span className="text-brand-500">Complimentary</span>
                  </div>
                  <div className="flex justify-between font-sans font-bold text-xl text-stone-900 border-t border-brand-50 pt-4 mt-4">
                    <span className="uppercase tracking-tight">Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-5 px-6 rounded-none transition-all duration-700 flex justify-center text-[10px] uppercase tracking-[0.2em] shadow-sm"
                >
                  Proceed to Checkout
                </Link>

                <p className="text-[9px] text-center text-stone-400 mt-6 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  🔒 Secured Checkout
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
