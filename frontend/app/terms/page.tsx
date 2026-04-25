'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';

export default function TermsOfService() {
  return (
    <div className="bg-white min-h-screen font-sans">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-brand prose-lg max-w-none"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-black text-brand-900 tracking-tighter mb-12">Terms of Service</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-8 font-bold">Last Updated: March 2026</p>
            
            <p className="text-brand-700 leading-relaxed">
              By accessing and using Pretty Luxe Atelier, you agree to abide by the following terms. Please read them carefully to understand our service commitments and your responsibilities.
            </p>

            <h3 className="font-black text-brand-900 tracking-tight mt-12 mb-4">1. Product Personalization</h3>
            <p className="text-brand-700">Customized products (engraved items) are made specifically for you. Once an order is processed, modifications or cancellations are not possible. Please double-check all personalization text before submission.</p>

            <h3 className="font-black text-brand-900 tracking-tight mt-12 mb-4">2. Payments & Pricing</h3>
            <p className="text-brand-700">All prices are in INR. We use Razorpay for secure transactions. Your order is confirmed only upon successful payment verification or selection of valid COD (where applicable).</p>

            <h3 className="font-black text-brand-900 tracking-tight mt-12 mb-4">3. Shipping & Delivery</h3>
            <p className="text-brand-700">Estimated delivery times are between 3-7 business days depending on location and customization level. We are not liable for delays caused by third-party logistics or incorrect address details.</p>

            <div className="mt-20 p-10 bg-brand-900 text-white rounded-[3rem]">
               <h4 className="font-black mb-2">Legal Jurisdiction</h4>
               <p className="text-sm text-brand-300">All disputes shall be governed by applicable law. Pretty Luxe Atelier reserves the right to choose the applicable jurisdiction.</p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
