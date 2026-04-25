'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { CheckCircle2, Package, Truck, Phone, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

const orderId = 'PT' + Math.floor(100000 + Math.random() * 900000);

export default function OrderConfirmationPage() {
  const { items } = useCart();

  return (
    <div className="bg-brand-50 min-h-screen font-sans">
      <Navbar alwaysSolid />
      <main className="container mx-auto px-4 md:px-6 py-10 md:py-14">

        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-none shadow-sm border border-brand-100 overflow-hidden"
          >
            <div className="bg-brand-50 p-8 md:p-10 text-center border-b border-brand-100">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle2 size={56} className="text-brand-500 mx-auto mb-6" />
              </motion.div>
              <h1 className="text-3xl font-heading text-stone-900 mb-2 uppercase tracking-tight">Order Confirmed</h1>
              <p className="text-stone-500 mb-6 text-[10px] font-bold uppercase tracking-widest">Thank you for your purchase. We&apos;ll begin personalizing it right away.</p>
              <div className="inline-block bg-white border border-brand-200 text-stone-900 font-bold text-xs px-6 py-3 rounded-none shadow-sm uppercase tracking-[0.2em]">
                Order #{orderId}
              </div>
            </div>

            <div className="p-6 md:p-10 space-y-8">
              {/* Delivery & Shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-brand-50 rounded-none p-6 border border-brand-100">
                  <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                    <MapPin size={14} className="text-brand-500" /> Delivery Address
                  </h3>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-relaxed">
                    As provided during checkout
                  </p>
                </div>

                <div className="bg-brand-50 rounded-none p-6 border border-brand-100">
                  <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                    <Truck size={14} className="text-brand-500" /> Expected Delivery
                  </h3>
                  <p className="font-bold text-brand-500 text-xl tracking-tight">2–4 Business Days</p>
                  <p className="text-[9px] text-stone-400 mt-2 font-bold uppercase tracking-widest">Express delivery available in metro cities</p>
                </div>
              </div>

              {/* What happens next */}
              <div>
                <h3 className="font-bold text-stone-900 mb-6 text-[10px] uppercase tracking-widest pb-3 border-b border-brand-50">What happens next?</h3>
                <div className="space-y-4">
                  {[
                    { icon: CheckCircle2, text: 'Order confirmed & payment processed' },
                    { icon: Package, text: 'Personalization & quality check (1–2 days)' },
                    { icon: Truck, text: 'Shipped with tracking via premium carrier' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-4 text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                      <step.icon size={14} className="text-brand-500 shrink-0" />
                      {step.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-brand-50">
                <Link
                  href="/track"
                  className="flex-1 px-6 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-none text-[10px] text-center shadow-sm transition-all uppercase tracking-[0.2em]"
                >
                  Track Order
                </Link>
                <Link
                  href="/shop"
                  className="flex-1 px-6 py-4 bg-white border border-brand-200 hover:border-brand-500 text-stone-700 hover:text-brand-500 font-bold rounded-none text-[10px] text-center transition-all uppercase tracking-[0.2em]"
                >
                  Continue Shopping
                </Link>
              </div>

              <p className="text-center text-[9px] text-stone-400 font-bold uppercase tracking-[0.2em]">
                A confirmation email has been sent to your address.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
