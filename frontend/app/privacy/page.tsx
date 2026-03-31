'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
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
            <h1 className="text-4xl md:text-6xl font-heading font-black text-brand-900 tracking-tighter mb-12">Privacy Policy</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-8 font-bold">Last Updated: March 2026</p>
            
            <p className="text-brand-700 leading-relaxed">
              At Pretty Tiffin, your privacy is paramount. This policy outlines how we collect, use, and safeguard your data when you interact with our premium D2C platform.
            </p>

            <h3 className="font-black text-brand-900 tracking-tight mt-12 mb-4">1. Information We Collect</h3>
            <p className="text-brand-700">We collect information to provide better services, including:</p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700">
               <li>Identity details (Name, Phone, Email).</li>
               <li>Shipping and Billing addresses.</li>
               <li>Personalization data (Engraving text, Gift messages).</li>
               <li>Device and usage data via cookies.</li>
            </ul>

            <h3 className="font-black text-brand-900 tracking-tight mt-12 mb-4">2. How We Use Data</h3>
            <p className="text-brand-700">Your data is used to process orders, personalize products, and provide a seamless checkout experience. We do not sell your personal data to third parties.</p>

            <h3 className="font-black text-brand-900 tracking-tight mt-12 mb-4">3. Security</h3>
            <p className="text-brand-700">We implement high-grade encryption and secure infrastructure (Redis sessions, JWT) to protect your sensitive information during every transaction.</p>
            
            <div className="mt-20 p-10 bg-brand-50 rounded-[3rem] border border-brand-100">
               <h4 className="font-black text-brand-900 mb-2">Questions?</h4>
               <p className="text-sm text-brand-500">Contact our privacy team at privacy@prettytiffin.com</p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
