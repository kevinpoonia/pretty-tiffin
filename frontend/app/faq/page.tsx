'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Truck, ShieldCheck, Gift, Palette } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const FAQ_DATA = [
  {
    category: 'Products & Quality',
    icon: ShieldCheck,
    questions: [
      { q: "What grade of stainless steel do you use?", a: "We use premium food-grade stainless steel (304 series) for all our tiffin boxes. It is rust-proof, BPA-free, and designed to last a lifetime." },
      { q: "Are the tiffins leak-proof?", a: "Most of our multi-tier tiffins are designed for semi-solid foods. For liquids, we recommend our specialized 'Deep' series which features silicone gaskets for a leak-proof seal." },
      { q: "Can I use these tiffins in a microwave?", a: "No, stainless steel is not microwave-safe. However, you can safely heat them in a conventional oven or by placing the containers in boiling water." }
    ]
  },
  {
    category: 'Customization',
    icon: Palette,
    questions: [
      { q: "How long does engraving take?", a: "Custom engraving typically adds 1-2 business days to our processing time. We use precision laser technology to ensure high-quality, permanent results." },
      { q: "Can I engrave emojis or complex logos?", a: "We currently support standard alphanumeric characters and a selection of premium symbols. For custom logos or bulk orders, please contact our support team." },
      { q: "Will the engraving fade over time?", a: "No. Our laser engraving process physically alters the surface of the steel, making it permanent and resistant to washing or wear." }
    ]
  },
  {
    category: 'Shipping & Gifting',
    icon: Truck,
    questions: [
      { q: "How long does delivery take within India?", a: "Standard delivery takes 3-5 business days. Express shipping options are available for major metros (2-3 business days)." },
      { q: "Do you offer international shipping?", a: "Currently, we ship only within India. We are working on expanding our reach soon!" },
      { q: "Can I schedule a gift delivery?", a: "Yes! You can choose 'Schedule Delivery' at checkout and select your preferred delivery date for special occasions." }
    ]
  },
  {
    category: 'Corporate Gifting',
    icon: Gift,
    questions: [
      { q: "Do you offer discounts for bulk orders?", a: "Yes, we have specialized pricing for corporate gifting and bulk orders (20+ units). Reach out to us at sales@prettytiffin.com." },
      { q: "Can you provide custom packaging for events?", a: "Absolutely. We offer premium gift-wrapping and can even include personalized thank-you notes for large scale events." }
    ]
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(FAQ_DATA[0].category);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = FAQ_DATA.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="bg-brand-50/30 min-h-screen font-sans">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-5xl">
          
          <div className="text-center mb-16">
             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="text-4xl md:text-6xl font-heading font-black text-brand-900 tracking-tighter mb-8 leading-none"
             >
               How can we <br />
               <span className="text-brand-500 italic font-serif text-3xl md:text-5xl">Assist you today?</span>
             </motion.h1>
             
             {/* Search Bar */}
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="relative max-w-xl mx-auto mt-12 bg-white rounded-3xl shadow-2xl shadow-brand-900/5 group p-2 overflow-hidden"
             >
                <div className="absolute inset-y-0 left-6 flex items-center text-brand-400 group-focus-within:text-brand-900 transition-colors">
                   <Search size={20} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search for questions..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none py-4 pl-14 pr-6 text-sm font-bold text-brand-900 outline-none placeholder-brand-300"
                />
             </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
             
             {/* Left: Categories */}
             <div className="md:col-span-1 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 ml-4 mb-6">Categories</p>
                {FAQ_DATA.map((cat, i) => (
                  <button 
                    key={i}
                    onClick={() => { setActiveCategory(cat.category); setOpenIndex(null); }}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                      activeCategory === cat.category 
                        ? 'bg-brand-900 text-white shadow-xl translate-x-2' 
                        : 'text-brand-400 hover:bg-white hover:text-brand-900'
                    }`}
                  >
                    <cat.icon size={16} /> {cat.category}
                  </button>
                ))}
             </div>

             {/* Right: Questions */}
             <div className="md:col-span-3 space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeCategory + searchQuery}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {filteredData.find(cat => cat.category === activeCategory)?.questions.map((item, idx) => (
                       <div 
                         key={idx} 
                         className="bg-white border border-brand-100 rounded-[2rem] overflow-hidden hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300"
                       >
                          <button 
                            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                            className="w-full flex items-center justify-between px-8 py-7 text-left"
                          >
                             <span className="font-heading font-black text-brand-900 tracking-tight pr-8">{item.q}</span>
                             <div className={`w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0 transition-transform duration-500 ${openIndex === idx ? 'rotate-180 bg-brand-900 text-white shadow-lg' : 'text-brand-400'}`}>
                                <ChevronDown size={18} />
                             </div>
                          </button>
                          
                          <motion.div 
                            initial={false}
                            animate={{ height: openIndex === idx ? 'auto' : 0 }}
                            className="overflow-hidden"
                          >
                             <div className="px-8 pb-8 text-brand-600 text-sm leading-relaxed border-t border-brand-50 pt-6">
                                {item.a}
                             </div>
                          </motion.div>
                       </div>
                    ))}
                    
                    {filteredData.length === 0 && (
                      <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-brand-200">
                         <p className="text-brand-400 font-bold uppercase tracking-widest text-xs">No questions match your search</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
             </div>
          </div>
          
          <div className="mt-24 p-12 bg-white rounded-[4rem] text-center border border-brand-100 shadow-2xl shadow-brand-900/5 overflow-hidden relative group">
             <div className="absolute -top-32 -left-32 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-50 group-hover:scale-125 transition-transform" />
             <div className="relative z-10">
                <h4 className="text-2xl font-black text-brand-900 mb-4 tracking-tight">Still have questions?</h4>
                <p className="text-brand-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">Our support team is always ready to help you with anything you need.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                   <a href="mailto:hello@prettytiffin.com" className="px-8 py-4 bg-brand-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-800 transition-all shadow-xl shadow-brand-900/20 active:scale-95">Shoot an Email</a>
                   <a href="https://wa.me/919999988888" className="px-8 py-4 bg-[#25D366] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-xl transition-all active:scale-95">Chat on WhatsApp</a>
                </div>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
