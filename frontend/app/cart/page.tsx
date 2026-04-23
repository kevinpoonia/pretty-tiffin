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
      <div className="bg-[#faf8f4] min-h-screen flex flex-col">
        <Navbar alwaysSolid />
        <main className="flex-1 flex justify-center items-center">
          <p className="text-gray-500 font-semibold animate-pulse">Loading Cart Securely...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <Navbar alwaysSolid />
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-10">

        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Shopping Cart ({items.length} {items.length === 1 ? 'Item' : 'Items'})
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 md:p-16 text-center">
            <ShoppingBag size={56} className="mx-auto mb-4 text-brand-200" />
            <h2 className="text-xl font-bold text-gray-700 mb-3">Your cart is empty.</h2>
            <p className="text-gray-500 mb-8">Personalize a premium tiffin today and make someone&apos;s day special!</p>
            <Link
              href="/shop"
              className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-10 rounded-xl transition-colors shadow-sm"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Cart Items */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-5">
              {items.map((item, idx) => (
                <div
                  key={`${item.id || item.productId}-${idx}`}
                  className="flex gap-4 pb-5 border-b border-gray-100 last:border-b-0 last:pb-0"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-brand-50 rounded-xl flex-shrink-0 relative overflow-hidden border border-gray-100">
                    <Image
                      src={item.imageUrl || '/images/product-1.png'}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base leading-tight line-clamp-2">{item.name}</h3>
                      <p className="font-bold text-gray-900 text-base sm:text-lg shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>

                    {item.customization && Object.keys(item.customization).length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {Object.entries(item.customization).map(([key, value]) =>
                          value ? (
                            <p key={key} className="text-xs text-gray-500">
                              <span className="font-medium text-gray-600">{key}:</span> {String(value)}
                            </p>
                          ) : null
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id!, Math.max(1, item.quantity - 1))}
                          className="px-3 py-1.5 font-bold text-gray-600 hover:bg-gray-50 text-sm transition-colors"
                        >
                          −
                        </button>
                        <span className="px-3 py-1.5 border-x border-gray-200 text-sm font-semibold min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                          className="px-3 py-1.5 font-bold text-gray-600 hover:bg-gray-50 text-sm transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id!, item.name)}
                        className="text-gray-400 hover:text-brand-500 flex items-center gap-1.5 text-xs font-medium transition-colors"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Link href="/shop" className="text-brand-500 font-semibold hover:underline text-sm">
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[22rem] flex-shrink-0 space-y-4">
              <Link
                href="/gift"
                className="bg-brand-50 border border-brand-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="bg-white p-2.5 rounded-full text-brand-500 shadow-sm shrink-0">
                  <Gift size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">Make it a Gift?</p>
                  <p className="text-xs text-gray-500">Add message card & premium wrap</p>
                </div>
                <ChevronRight size={18} className="text-brand-400 shrink-0" />
              </Link>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 xl:sticky xl:top-28">
                <h2 className="font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-100 pt-3">
                    <span>Payable Amount</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl transition-colors flex justify-center text-sm shadow-md"
                >
                  PROCEED TO CHECKOUT
                </Link>

                <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                  🔒 Safe and Secure Payments
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
