'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Heart, ShieldCheck, Truck, Users } from 'lucide-react';

export default function AboutPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  };

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-brand-500 selection:text-white">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-brand-900">
           <div className="absolute inset-0 opacity-40">
              <Image 
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop" 
                alt="Heritage Background" 
                fill 
                className="object-cover scale-110"
              />
           </div>
           <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/60 to-transparent" />
           <div className="container mx-auto px-6 relative z-10 text-center">
              <motion.span 
                initial={{ opacity: 0, letterSpacing: '0.2em' }}
                animate={{ opacity: 1, letterSpacing: '0.4em' }}
                className="text-brand-400 font-bold text-[10px] uppercase tracking-[0.4em] mb-6 block"
              >
                Our Story • Since 2023
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-7xl font-heading font-black text-white tracking-tighter mb-8 leading-none"
              >
                Revolutionizing India&apos;s <br />
                <span className="text-brand-500 italic font-serif">Lunch Experience.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-brand-100 max-w-2xl mx-auto text-lg opacity-80 leading-relaxed"
              >
                Pretty Tiffin was born from a simple desire: to blend India&apos;s rich tiffin culture with premium craftsmanship and modern personalization.
              </motion.p>
           </div>
        </section>

        {/* The Vision Section */}
        <section className="py-24 bg-white overflow-hidden">
           <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                 <motion.div {...fadeIn}>
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-brand-500 mb-4">The Craft</h2>
                    <h3 className="text-3xl md:text-5xl font-heading font-black text-brand-900 tracking-tighter mb-8 leading-tight">
                      Stainless Steel <br />Meet&apos;s Artistry.
                    </h3>
                    <div className="space-y-6 text-brand-700 leading-relaxed text-lg opacity-90">
                       <p>
                          Every Pretty Tiffin is crafted from premium ISO-grade stainless steel. But we don&apos;t stop at durability. We believe your daily companion should be as unique as your story.
                       </p>
                       <p>
                          Our signature laser-engraving process allows you to immortalize names, dates, or messages directly onto the steel, creating a gift that lasts a lifetime.
                       </p>
                    </div>
                    <div className="mt-12 grid grid-cols-2 gap-8">
                       <div>
                          <p className="text-3xl font-heading font-black text-brand-900">10k+</p>
                          <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Happy Customers</p>
                       </div>
                       <div>
                          <p className="text-3xl font-heading font-black text-brand-900">100%</p>
                          <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Eco-friendly</p>
                       </div>
                    </div>
                 </motion.div>
                 
                 <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1 }}
                    className="relative aspect-square rounded-[4rem] overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700"
                 >
                    <Image 
                      src="https://images.unsplash.com/photo-1614073705773-5fd375fe9101?q=80&w=2070&auto=format&fit=crop" 
                      alt="Tiffin Craftsmanship" 
                      fill 
                      className="object-cover"
                    />
                    <div className="absolute inset-0 ring-1 ring-black/10 rounded-[4rem]" />
                 </motion.div>
              </div>
           </div>
        </section>

        {/* Values Section */}
        <section className="py-24 bg-brand-50 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100 rounded-full blur-3xl -mr-48 -mt-48 opacity-50" />
           <div className="container mx-auto px-6 relative z-10">
              <div className="text-center mb-20">
                 <h2 className="text-[10px] font-black uppercase tracking-widest text-brand-500 mb-4">Our DNA</h2>
                 <h3 className="text-3xl md:text-5xl font-heading font-black text-brand-900 tracking-tighter">Small Details, Big Impact.</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {[
                    { icon: Heart, title: 'Made with Love', desc: 'Every product is hand-finished and inspected for quality.' },
                    { icon: ShieldCheck, title: 'Premium Quality', desc: 'Only high-grade, food-safe stainless steel is used.' },
                    { icon: Truck, title: 'Pan-India Reach', desc: 'Secure shipping to every corner of India within 3-5 days.' },
                    { icon: Users, title: 'Customer First', desc: 'Personalized support for every order, big or small.' },
                 ].map((value, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-brand-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group"
                    >
                       <div className="w-14 h-14 bg-brand-900 text-brand-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-500 transition-colors">
                          <value.icon size={24} />
                       </div>
                       <h4 className="font-heading font-black text-brand-900 text-lg mb-3 tracking-tight">{value.title}</h4>
                       <p className="text-brand-500 text-sm leading-relaxed">{value.desc}</p>
                    </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-white">
           <div className="container mx-auto px-6 text-center">
              <div className="max-w-4xl mx-auto bg-brand-900 rounded-[4rem] p-16 md:p-24 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                 <div className="relative z-10">
                    <h2 className="text-3xl md:text-6xl font-heading font-black text-white tracking-tighter mb-8 leading-none">
                       Experience the <br />Pretty Tiffin Standard.
                    </h2>
                    <p className="text-brand-300 mb-12 text-lg max-w-xl mx-auto opacity-80">
                       Ready to personalize your first tiffin? Join thousands of happy customers today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                       <Link href="/shop" className="w-full sm:w-auto px-10 py-5 bg-brand-500 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-brand-400 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-500/20">
                          Browse Collection
                       </Link>
                       <Link href="/contact" className="w-full sm:w-auto px-10 py-5 border-2 border-white/20 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                          Contact Us
                       </Link>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
