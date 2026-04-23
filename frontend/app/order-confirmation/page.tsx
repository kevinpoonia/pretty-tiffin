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
    <div className="bg-[#faf8f4] min-h-screen">
      <Navbar alwaysSolid />
      <main className="container mx-auto px-4 md:px-6 py-10 md:py-14">

        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="bg-green-50 p-8 md:p-10 text-center border-b border-green-100">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
              <p className="text-gray-600 mb-3">Thank you for your purchase. We&apos;ll begin personalizing it right away.</p>
              <div className="inline-block bg-white border border-green-200 text-gray-900 font-bold text-base px-6 py-2 rounded-full shadow-sm">
                Order #{orderId}
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Delivery & Shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-brand-50 rounded-xl p-5 border border-brand-100">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-brand-500" /> Delivery Address
                  </h3>
                  <p className="text-sm text-gray-700 font-semibold mb-1">Your Address</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    As provided during checkout
                  </p>
                </div>

                <div className="bg-brand-50 rounded-xl p-5 border border-brand-100">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                    <Truck size={16} className="text-brand-500" /> Expected Delivery
                  </h3>
                  <p className="font-bold text-green-600 text-lg">2–4 Business Days</p>
                  <p className="text-xs text-gray-500 mt-1">Express delivery available in metro cities</p>
                </div>
              </div>

              {/* What happens next */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4 text-sm">What happens next?</h3>
                <div className="space-y-3">
                  {[
                    { icon: CheckCircle2, text: 'Order confirmed & payment processed' },
                    { icon: Package, text: 'Personalization & quality check (1–2 days)' },
                    { icon: Truck, text: 'Shipped with tracking via BlueDart / Delhivery' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                      <step.icon size={16} className="text-brand-500 shrink-0" />
                      {step.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <Link
                  href="/track"
                  className="flex-1 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm text-center shadow-sm transition-colors"
                >
                  TRACK ORDER
                </Link>
                <Link
                  href="/shop"
                  className="flex-1 px-6 py-3 bg-white border border-gray-200 hover:border-brand-500 text-gray-700 hover:text-brand-500 font-bold rounded-xl text-sm text-center transition-colors"
                >
                  CONTINUE SHOPPING
                </Link>
              </div>

              <p className="text-center text-xs text-gray-400">
                A confirmation email has been sent to your registered email address.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
