'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Truck, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ShippingReturns() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div {...fadeIn}>
            <h1 className="text-4xl md:text-6xl font-heading font-black text-brand-900 tracking-tighter mb-12">Shipping & Returns</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
               <div className="bg-brand-50 p-10 rounded-[3rem] border border-brand-100">
                  <div className="w-12 h-12 bg-brand-900 text-white rounded-2xl flex items-center justify-center mb-6">
                     <Truck size={24} />
                  </div>
                  <h3 className="font-black text-brand-900 text-xl tracking-tight mb-4">Fast Shipping</h3>
                  <p className="text-sm text-brand-600 leading-relaxed">
                     Delivery in 3-5 business days across India. Express shipping available for all major metropolitan cities.
                  </p>
               </div>
               <div className="bg-brand-50 p-10 rounded-[3rem] border border-brand-100">
                  <div className="w-12 h-12 bg-white text-brand-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                     <ShieldCheck size={24} />
                  </div>
                  <h3 className="font-black text-brand-900 text-xl tracking-tight mb-4">Tracked Parcels</h3>
                  <p className="text-sm text-brand-600 leading-relaxed">
                     Receive real-time updates via SMS and Email. Use our tracking page to see your parcel&apos;s journey.
                  </p>
               </div>
            </div>

            <div className="prose prose-brand prose-lg max-w-none">
               <h3 className="font-black text-brand-900 tracking-tight mb-6">Returns Policy</h3>
               <p className="text-brand-700 mb-8">
                 We take immense pride in our craftsmanship. However, if you receive a damaged or incorrect product, we&apos;re here to help.
               </p>

               <div className="flex items-start gap-4 p-8 bg-red-50 rounded-3xl border border-red-100 mb-10">
                  <AlertTriangle className="text-red-500 shrink-0 mt-1" size={20} />
                  <div>
                     <p className="font-black text-red-900 text-sm tracking-tight mb-1">Important for Custom Orders</p>
                     <p className="text-xs text-red-700">Due to the personalized nature of engraved tiffins, we do not accept returns or exchanges unless the item is defective or damaged upon arrival.</p>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-start gap-6">
                     <div className="w-8 h-8 rounded-full bg-brand-900 text-white flex items-center justify-center font-black text-xs shrink-0 mt-1">1</div>
                     <div>
                        <p className="font-black text-brand-900 mb-1">Reporting Issues</p>
                        <p className="text-sm text-brand-500">Email us within 48 hours of delivery at support@prettytiffin.com with photos of the issue.</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-6">
                     <div className="w-8 h-8 rounded-full bg-brand-900 text-white flex items-center justify-center font-black text-xs shrink-0 mt-1">2</div>
                     <div>
                        <p className="font-black text-brand-900 mb-1">Quality Check</p>
                        <p className="text-sm text-brand-500">Our team will review your claim and authorize a return or refund if applicable.</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-6">
                     <div className="w-8 h-8 rounded-full bg-brand-900 text-white flex items-center justify-center font-black text-xs shrink-0 mt-1">3</div>
                     <div>
                        <p className="font-black text-brand-900 mb-1">Processing</p>
                        <p className="text-sm text-brand-500">Refunds are processed within 7-10 business days back to your original payment method.</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="mt-20 p-12 bg-brand-900 rounded-[4rem] text-center text-white">
               <RotateCcw size={40} className="mx-auto mb-6 text-brand-400 opacity-50" />
               <h4 className="text-2xl font-black mb-4">Hassle-free Returns</h4>
               <p className="text-brand-300 max-w-sm mx-auto text-sm mb-8 font-bold uppercase tracking-widest leading-relaxed">Only for non-customized products in unused condition within 7 days.</p>
               <Link href="/contact" className="inline-block px-10 py-5 bg-white text-brand-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-50 transition-all shadow-2xl active:scale-95">Initiate Return</Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
