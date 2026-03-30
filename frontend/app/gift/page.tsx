'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Gift, Calendar, Edit3, PackageOpen } from 'lucide-react';
import Link from 'next/link';

export default function GiftingPage() {
  const [occasion, setOccasion] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [giftWrap, setGiftWrap] = useState(false);

  const occasions = ['Birthday', 'Anniversary', 'Corporate', 'Housewarming', 'Wedding', 'Just Because'];

  return (
    <>
      <Navbar alwaysSolid />
      <main className="flex-1 bg-brand-50 pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            
            <div className="text-center mb-12">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-brand-200 text-brand-600 mb-6">
                <Gift size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-brand-900 mb-4">The Art of Gifting</h1>
              <p className="text-brand-600 text-lg">Send a timeless, personalized Tiffin directly to their doorstep.</p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-brand-100"
            >
              <form className="space-y-8">
                
                {/* Occasion */}
                <div>
                  <label className="flex items-center gap-2 font-heading font-semibold text-lg text-brand-900 mb-4">
                    <Star size={20} className="text-brand-500" /> What's the occasion?
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {occasions.map((occ) => (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => setOccasion(occ)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                          occasion === occ 
                            ? 'bg-brand-500 text-white shadow-md' 
                            : 'bg-brand-50 text-brand-700 border border-brand-200 hover:border-brand-500 hover:text-brand-500'
                        }`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="flex items-center gap-2 font-heading font-semibold text-lg text-brand-900 mb-4">
                    <Calendar size={20} className="text-brand-500" /> Planned Delivery Date
                  </label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full md:w-1/2 bg-brand-50 border border-brand-200 text-brand-900 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 font-medium" 
                  />
                  <p className="text-xs text-brand-500 mt-2">*Please allow 4-6 days for personalized orders.</p>
                </div>

                {/* Personal Message */}
                <div>
                  <label className="flex items-center gap-2 font-heading font-semibold text-lg text-brand-900 mb-4">
                    <Edit3 size={20} className="text-brand-500" /> Personal Message Card
                  </label>
                  <textarea 
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Dear [Name], Wishing you..."
                    className="w-full bg-brand-50 border border-brand-200 text-brand-900 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 resize-none font-medium" 
                  />
                </div>

                {/* Gift Wrap */}
                <div className="p-5 rounded-2xl border-2 border-brand-100 flex items-start gap-4 cursor-pointer hover:border-brand-300 transition-colors"
                     onClick={() => setGiftWrap(!giftWrap)}>
                  <div className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    giftWrap ? 'bg-brand-500 border-brand-500' : 'border-brand-300'
                  }`}>
                    {giftWrap && <Check size={14} className="text-white" />}
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-brand-900 flex items-center gap-2">
                      <PackageOpen size={18} className="text-brand-500" /> Premium Silk Packaging (+₹299)
                    </h4>
                    <p className="text-sm text-brand-600 mt-1">Delivered in our signature embossed luxury box wrapped in raw silk fabric.</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-brand-100 flex justify-end">
                  <Link href="/shop" className="bg-brand-900 text-white px-8 py-4 rounded-full font-medium hover:bg-brand-800 transition-transform hover:-translate-y-1 shadow-lg shadow-brand-900/10">
                    Save Gift Options & Shop
                  </Link>
                </div>

              </form>
            </motion.div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// Temporary Icon definitions for missing lucide-react imports
const Star = ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const Check = ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>;
