'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Star, ShieldCheck, Heart, Truck } from 'lucide-react';

export default function GiftsForHusband() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <Navbar />
      
      <main className="pt-20">
        {/* SEO Header Section */}
        <section className="bg-brand-50 py-24 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100 rounded-full blur-3xl -mr-48 -mt-48 opacity-50" />
           <div className="container mx-auto px-6 relative z-10 text-center">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 mb-6 block"
              >
                Curated Gifting Guide • India
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-7xl font-heading font-black text-brand-900 tracking-tighter mb-8 leading-none"
              >
                Unique <span className="text-brand-500 italic font-serif">Gifts for Husband</span> <br />
                that Last a Lifetime.
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-brand-700 max-w-2xl mx-auto text-lg leading-relaxed opacity-90"
              >
                Searching for a practical yet sentimental gift for your husband? Our premium, personalized stainless steel tiffins are the ultimate choice for work, travel, and health.
              </motion.p>
           </div>
        </section>

        {/* SEO Content / Features */}
        <section className="py-24 bg-white">
           <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                 <motion.div {...fadeIn}>
                    <h2 className="text-3xl font-heading font-black text-brand-900 tracking-tight mb-8">Why a Pretty Tiffin is the Perfect Gift?</h2>
                    <div className="space-y-10">
                       {[
                          { title: 'Personalized Laser Engraving', desc: 'Add his name, a special date, or a witty message that never fades.', icon: ShieldCheck },
                          { title: 'Premium Health-First Design', desc: 'Ditch the plastic. 100% food-grade stainless steel for his daily meals.', icon: Heart },
                          { title: 'Express Delivery Across India', desc: 'Securely delivered to major cities (Mumbai, Delhi, Bangalore) in 3 days.', icon: Truck },
                       ].map((feat, i) => (
                          <div key={i} className="flex gap-6">
                             <div className="w-12 h-12 bg-brand-900 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-900/20">
                                <feat.icon size={20} />
                             </div>
                             <div>
                                <h4 className="font-heading font-black text-brand-900 text-lg mb-2 tracking-tight">{feat.title}</h4>
                                <p className="text-brand-500 text-sm leading-relaxed">{feat.desc}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </motion.div>

                 <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="relative aspect-square rounded-[4rem] overflow-hidden shadow-2xl"
                 >
                    <Image 
                      src="https://images.unsplash.com/photo-1544237562-ad116ca58a7d?q=80&w=2070&auto=format&fit=crop" 
                      alt="Gift for husband" 
                      fill 
                      className="object-cover" 
                    />
                 </motion.div>
              </div>
           </div>
        </section>

        {/* Curated Products Section */}
        <section className="py-24 bg-brand-50/50">
           <div className="container mx-auto px-6 text-center">
              <h2 className="text-3xl font-heading font-black text-brand-900 tracking-tight mb-16">Bestsellers for Men</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {[
                    { name: 'The Executive 3-Tier', slug: 'executive-3-tier', price: 1499, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop' },
                    { name: 'Deep Steel 2-Tier', slug: 'deep-2-tier', price: 1299, image: 'https://images.unsplash.com/photo-1614073705773-5fd375fe9101?q=80&w=2070&auto=format&fit=crop' },
                    { name: 'Midnight Black Edition', slug: 'midnight-black-ed', price: 1899, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=2070&auto=format&fit=crop' },
                    { name: 'Heritage Carrier', slug: 'heritage-carrier', price: 999, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop' },
                 ].map((p, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -10 }}
                      className="bg-white p-6 rounded-[3rem] border border-brand-100 shadow-sm"
                    >
                       <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden mb-6 bg-brand-50">
                          <Image src={p.image} alt={p.name} fill className="object-cover" />
                       </div>
                       <h3 className="font-heading font-black text-brand-900 mb-2 tracking-tight">{p.name}</h3>
                       <p className="text-brand-500 font-bold mb-6">₹{p.price}</p>
                       <Link href={`/shop/${p.slug}`} className="block w-full py-4 bg-brand-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-800 transition-all">
                          Personalize Now
                       </Link>
                    </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* SEO FAQ Section */}
        <section className="py-24 bg-white">
           <div className="container mx-auto px-6 max-w-3xl">
              <h2 className="text-3xl font-heading font-black text-brand-900 tracking-tight text-center mb-16">Gift Buying Guide FAQs</h2>
              <div className="space-y-8">
                 {[
                    { q: 'Can I add a custom message for my husband?', a: 'Yes! Our laser engraving allows you to add up to 25 characters on the top or side of the tiffin. You can also add a gift message in the cart.' },
                    { q: 'Is it suitable for his office lunch?', a: 'Absolutely. Pretty Tiffins are designed for professional environments with a sleek aesthetic and durable build.' },
                    { q: 'Will the engraving fade with daily washing?', a: 'No, laser engraving is permanent. It will not scratch or fade even with regular scrubbing.' }
                 ].map((faq, i) => (
                    <div key={i} className="border-b border-brand-50 pb-8">
                       <h4 className="font-black text-brand-900 mb-4 text-lg tracking-tight">{faq.q}</h4>
                       <p className="text-brand-600 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
