'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Star, ShieldCheck, Heart, Truck, Check, Share2, Info, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [activeColor, setActiveColor] = useState('Classic Steel');
  const [engravingText, setEngravingText] = useState('');
  const [quantity, setQuantity] = useState(1);

  const colors = [
    { name: 'Classic Steel', class: 'bg-gray-300' },
    { name: 'Premium Gold', class: 'bg-[#d4af37]' },
    { name: 'Rose Gold', class: 'bg-[#b76e79]' },
  ];

  const getTiffinColor = () => {
    if (activeColor === 'Premium Gold') return 'bg-gradient-to-br from-yellow-300 to-yellow-600';
    if (activeColor === 'Rose Gold') return 'bg-gradient-to-br from-rose-300 to-rose-600';
    return 'bg-gradient-to-br from-gray-200 to-gray-400';
  };

  return (
    <>
      <Navbar alwaysSolid />
      <main className="flex-1 bg-white pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          
          <div className="flex flex-col lg:flex-row gap-12 pt-8">
            
            {/* Left: Product Images & Customizer Preview */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              {/* Main Preview */}
              <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-brand-50 flex items-center justify-center p-8 sticky top-28">
                {/* Simulated Tiffin Box using CSS */}
                <motion.div 
                  layout
                  className={`relative w-64 h-80 rounded-[40px] shadow-2xl flex flex-col items-center justify-center transition-all duration-500 ${getTiffinColor()}`}
                  style={{
                    boxShadow: 'inset -10px -10px 30px rgba(0,0,0,0.1), 10px 10px 30px rgba(0,0,0,0.15), inset 10px 10px 20px rgba(255,255,255,0.8)'
                  }}
                >
                  {/* Tiffin Lids / Lines */}
                  <div className="absolute top-1/3 w-full h-[2px] bg-black/10 backdrop-blur-sm" />
                  <div className="absolute top-2/3 w-full h-[2px] bg-black/10 backdrop-blur-sm" />
                  
                  {/* Handle */}
                  <div className="absolute -top-6 w-32 h-12 border-4 border-gray-400 rounded-t-full" />

                  {/* Engraving Preview */}
                  <AnimatePresence mode="popLayout">
                    {engravingText && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] text-center mix-blend-overlay"
                      >
                        <p className="font-heading font-semibold text-2xl text-black/60 tracking-wider font-serif" style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.4)' }}>
                          {engravingText}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
              
              {/* Thumbnails */}
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map((thumb) => (
                  <div key={thumb} className="w-20 h-20 rounded-xl bg-brand-100 flex-shrink-0 cursor-pointer border-2 border-transparent hover:border-brand-500 transition-colors" />
                ))}
              </div>
            </div>

            {/* Right: Product Info & Configurator */}
            <div className="w-full lg:w-1/2 flex flex-col pt-4">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center text-brand-500">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} className="fill-brand-500" />)}
                  </div>
                  <span className="text-sm text-brand-600 underline cursor-pointer">42 Reviews</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold font-heading text-brand-900 mb-2">The Executive 3-Tier Tiffin</h1>
                <p className="text-2xl font-semibold text-brand-900">₹1,499</p>
              </div>

              <p className="text-brand-700 leading-relaxed mb-8">
                Crafted from premium 304 food-grade stainless steel, this 3-tier tiffin is designed to keep your meals fresh and your style elevated. Personalize it with bespoke laser engraving to make it truly yours.
              </p>

              {/* Configure Color */}
              <div className="mb-8 border-t border-brand-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-heading font-semibold text-brand-900">Color / Finish</h3>
                  <span className="text-sm font-medium text-brand-600">{activeColor}</span>
                </div>
                <div className="flex gap-4">
                  {colors.map((color) => (
                    <button 
                      key={color.name}
                      onClick={() => setActiveColor(color.name)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        activeColor === color.name ? 'ring-2 ring-offset-4 ring-brand-500' : 'ring-1 ring-brand-200'
                      }`}
                    >
                      <span className={`w-10 h-10 rounded-full shadow-inner ${color.class}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Configure Engraving */}
              <div className="mb-8 border-t border-brand-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-heading font-semibold text-brand-900 flex items-center gap-2">
                    Add Engraving <span className="bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded">Free</span>
                  </h3>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={15}
                    value={engravingText}
                    onChange={(e) => setEngravingText(e.target.value)}
                    placeholder="Enter name or short message (max 15 chars)"
                    className="w-full border border-brand-200 rounded-xl px-4 py-3 bg-brand-50 text-brand-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-brand-400 font-medium">
                    {engravingText.length}/15
                  </span>
                </div>
              </div>

              {/* Add to Cart Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10 pt-6 border-t border-brand-100">
                <div className="flex items-center border border-brand-200 rounded-full bg-brand-50 overflow-hidden w-full sm:w-32 shrink-0 lg:shrink">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-brand-600 hover:text-brand-900 hover:bg-brand-100 transition-colors">-</button>
                  <span className="flex-1 text-center font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-brand-600 hover:text-brand-900 hover:bg-brand-100 transition-colors">+</button>
                </div>
                
                <button 
                  onClick={async () => {
                    setIsAdding(true);
                    await addItem({
                      productId: 'prod_premium_tiffin_01', // Mock product ID
                      quantity,
                      price: 1499,
                      name: 'The Executive 3-Tier Tiffin',
                      customization: { engravingText, themeId: activeColor }
                    });
                    setIsAdding(false);
                    window.location.href = '/cart'; // Redirect to cart smoothly
                  }}
                  disabled={isAdding}
                  className="w-full sm:flex-1 bg-brand-900 text-white font-medium rounded-full py-4 px-8 hover:bg-brand-800 transition-all shadow-xl shadow-brand-900/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isAdding ? <><Loader2 size={18} className="animate-spin" /> ADDING TO CART...</> : `Add to Cart — ₹${1499 * quantity}`}
                </button>
                
                <button className="w-14 h-14 rounded-full border border-brand-200 flex items-center justify-center text-brand-600 hover:text-brand-500 hover:border-brand-500 hover:bg-brand-50 transition-all shrink-0">
                  <Heart size={20} />
                </button>
              </div>

              {/* Accordions */}
              <div className="flex flex-col gap-4">
                {[
                  { title: "Product Features & Specs", icon: Info },
                  { title: "Shipping & Delivery", icon: Truck },
                  { title: "Warranty Information", icon: ShieldCheck },
                ].map((acc, i) => (
                  <div key={i} className="border border-brand-100 rounded-xl p-4 cursor-pointer hover:border-brand-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <acc.icon size={18} className="text-brand-500" />
                        <span className="font-heading font-medium text-brand-900">{acc.title}</span>
                      </div>
                      <span className="text-brand-400">+</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
          
        </div>
      </main>
      <Footer />
    </>
  );
}
