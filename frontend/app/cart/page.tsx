'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Gift, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, total, loading, removeItem, updateQuantity } = useCart();

  if (loading) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex flex-col">
        <Navbar alwaysSolid />
        <main className="flex-1 flex justify-center items-center">
            <p className="text-gray-500 font-semibold animate-pulse">Loading Cart Securely...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <Navbar alwaysSolid />
      <main className="container mx-auto px-4 md:px-6 py-8">
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart ({items.length} {items.length === 1 ? 'Item' : 'Items'})</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded shadow-sm border border-gray-100 p-12 text-center">
             <h2 className="text-xl font-bold text-gray-700 mb-4">Your cart is feeling a bit empty.</h2>
             <p className="text-gray-500 mb-8">Personalize a premium tiffin today to keep your meals fresh!</p>
             <Link href="/shop" className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded transition-colors shadow-sm">
               START SHOPPING
             </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 bg-white rounded shadow-sm border border-gray-100 p-6 space-y-6">
              {items.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="flex flex-col md:flex-row gap-6 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                  {/* Product Image */}
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-red-50 rounded flex-shrink-0 relative overflow-hidden">
                    <Image src={item.imageUrl || "/images/product-1.png"} alt={item.name} fill className="object-cover mix-blend-multiply" />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 relative">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{item.name}</h3>
                    
                    {item.customization && (
                       <p className="text-sm text-gray-500 mb-2">
                         Engraving: "{item.customization.engravingText}" <br/> 
                         Theme: {item.customization.themeId}
                       </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border border-gray-200 rounded">
                        <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))} className="px-3 py-1 font-bold text-gray-600 hover:bg-gray-50">-</button>
                        <span className="px-3 py-1 border-x border-gray-200 text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-3 py-1 font-bold text-gray-600 hover:bg-gray-50">+</button>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-sm font-medium transition-colors">
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>

                    <div className="absolute top-0 right-0 text-right">
                      <p className="font-bold text-xl text-gray-900">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <Link href="/shop" className="text-red-500 font-semibold hover:underline">← Continue Shopping</Link>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="w-full lg:w-96 flex-shrink-0">
              {/* Gifting Add-on */}
              <div className="bg-red-50 border border-red-100 rounded p-4 flex items-center gap-4 mb-4 cursor-pointer hover:shadow-sm transition-shadow">
                <div className="bg-white p-2 rounded-full text-red-500 shadow-sm"><Gift size={20} /></div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Make it a Gift?</p>
                  <p className="text-xs text-gray-600">Add message card & premium wrap</p>
                </div>
                <ChevronRight size={18} className="text-red-400 ml-auto" />
              </div>

              <div className="bg-white rounded shadow-sm border border-gray-100 p-6 sticky top-28">
                <h2 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping charges</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-100 pt-3">
                    <span>Payable Amount</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <Link href="/checkout" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded transition-colors flex justify-center text-sm shadow-md">
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
