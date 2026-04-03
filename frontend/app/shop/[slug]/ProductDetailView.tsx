'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Star, ShieldCheck, Heart, Truck, Info, Loader2, Gift } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProductCustomizer from '@/components/products/ProductCustomizer';
import GiftSelector from '@/components/products/GiftSelector';
import { useAuth } from '@/context/AuthContext';

export default function ProductDetailClient({ product }: { product: any }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [giftDetails, setGiftDetails] = useState({
    occasion: '',
    message: '',
    scheduledFor: '',
    packaging: 'STANDARD'
  });
  const [quantity, setQuantity] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    // Initialize default options
    if (product?.customizationOptions) {
      const defaults: Record<string, string> = {};
      product.customizationOptions.forEach((opt: any) => {
        if (opt.values && opt.values.length > 0) {
          defaults[opt.label] = opt.values[0];
        }
      });
      setSelectedOptions(defaults);
    }
  }, [product]);

  const faqs = [
    { title: "Product Features & Specs", icon: Info, content: "Made from premium 304 food-grade stainless steel. Features a space-saving stacking design. Dimensions: 14cm x 14cm x 22cm when fully assembled." },
    { title: "Shipping & Delivery", icon: Truck, content: "Free express shipping across India. Orders placed before 1 PM are eligible for Same Day Delivery in select metro cities. Standard delivery takes 2-4 business days." },
    { title: "Warranty Information", icon: ShieldCheck, content: "Enjoy peace of mind with our 1-year manufacturer warranty. Covers structural defects, clip malfunctions, and transit damages." },
  ];

  const getTiffinColor = () => {
    const color = selectedOptions['Color'] || selectedOptions['Finish'] || 'Classic Steel';
    if (color === 'Premium Gold' || color === 'Gold') return 'bg-gradient-to-br from-yellow-300 to-yellow-600';
    if (color === 'Rose Gold' || color === 'Rose') return 'bg-gradient-to-br from-rose-300 to-rose-600';
    if (color === 'Midnight Black' || color === 'Black') return 'bg-gradient-to-br from-gray-800 to-black';
    return 'bg-gradient-to-br from-gray-200 to-gray-400';
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;
    let basePrice = Number(product.price);
    product.customizationOptions?.forEach((opt: any) => {
      if (selectedOptions[opt.label]) {
        basePrice += Number(opt.priceOffset) || 0;
      }
    });
    if (giftDetails.packaging === 'PREMIUM') basePrice += 99;
    if (giftDetails.packaging === 'LUXURY') basePrice += 299;
    return basePrice * quantity;
  };

  return (
    <>
      <Navbar alwaysSolid />
      <main className="flex-1 bg-white pt-28 md:pt-32 pb-16 md:pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 pt-6 md:pt-8">
            {/* Left: Product Images & Customizer Preview */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
              <div className="relative aspect-square w-full rounded-[28px] md:rounded-[40px] overflow-hidden bg-brand-50 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:sticky lg:top-24 shadow-inner border border-brand-100">
                {product.images?.[0] ? (
                  <div className="relative w-full h-full">
                     <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-3 sm:p-5 md:p-8 z-10" />
                     <AnimatePresence>
                        {selectedOptions['Engraving'] && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none mix-blend-overlay opacity-60"
                          >
                             <p className="font-serif italic font-bold text-2xl text-black select-none tracking-widest uppercase">
                               {selectedOptions['Engraving']}
                             </p>
                          </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
                ) : (
                  <motion.div 
                    layout
                    className={`relative w-64 h-80 rounded-[40px] shadow-2xl flex flex-col items-center justify-center transition-all duration-500 ${getTiffinColor()}`}
                    style={{ boxShadow: 'inset -10px -10px 30px rgba(0,0,0,0.1), 10px 10px 30px rgba(0,0,0,0.15), inset 10px 10px 20px rgba(255,255,255,0.8)' }}
                  >
                    <div className="absolute top-1/3 w-full h-[2px] bg-black/10 backdrop-blur-sm" />
                    <div className="absolute top-2/3 w-full h-[2px] bg-black/10 backdrop-blur-sm" />
                    <div className="absolute -top-6 w-32 h-12 border-4 border-gray-400 rounded-t-full" />
                    <AnimatePresence mode="popLayout">
                      {selectedOptions['Engraving'] && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] text-center mix-blend-overlay"
                        >
                          <p className="font-heading font-semibold text-2xl text-black/60 tracking-wider font-serif" style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.4)' }}>
                            {selectedOptions['Engraving']}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 no-scrollbar">
                {product.images?.map((thumb: string, i: number) => (
                  <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand-50 flex-shrink-0 cursor-pointer border-2 border-transparent hover:border-brand-500 transition-all relative overflow-hidden shadow-sm">
                    <Image src={thumb} alt={product.name} fill sizes="80px" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Product Info & Configurator */}
            <div className="w-full lg:w-1/2 flex flex-col pt-0 lg:pt-4">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center text-brand-500">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} className="fill-brand-500" />)}
                  </div>
                  <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">42 Verified Reviews</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-black font-heading text-brand-900 mb-4 tracking-tighter leading-tight">{product.name}</h1>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                   <p className="text-2xl sm:text-3xl font-black text-brand-900 tracking-tighter">₹{Number(product.price).toLocaleString('en-IN')}</p>
                   {product.compareAtPrice && <p className="text-lg text-brand-300 line-through font-bold">₹{Number(product.compareAtPrice).toLocaleString('en-IN')}</p>}
                   <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">In Stock</span>
                </div>
              </div>

              <p className="text-brand-600 font-medium leading-relaxed mb-10 text-sm">
                {product.description}
              </p>

              <ProductCustomizer 
                options={product.customizationOptions || []} 
                selectedOptions={selectedOptions} 
                onChange={(label: string, val: string) => setSelectedOptions(prev => ({ ...prev, [label]: val }))} 
              />

              <div className="mt-10">
                <GiftSelector 
                  giftDetails={giftDetails} 
                  onChange={(details: any) => setGiftDetails(prev => ({ ...prev, ...details }))} 
                />
              </div>

              <div className="mt-8 md:mt-10 bg-white/95 backdrop-blur-xl p-4 rounded-[24px] md:rounded-[32px] border border-brand-100 shadow-2xl flex flex-col sm:flex-row gap-4 z-20 2xl:sticky 2xl:bottom-6">
                <div className="flex items-center border border-brand-200 rounded-2xl bg-brand-50 overflow-hidden w-full sm:w-32 shrink-0">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-brand-600 hover:text-brand-900 transition-colors font-black">-</button>
                  <span className="flex-1 text-center font-black text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-brand-600 hover:text-brand-900 transition-colors font-black">+</button>
                </div>
                <button 
                  onClick={async () => {
                    setIsAdding(true);
                    try {
                      await addItem({
                        productId: product.id,
                        quantity,
                        price: calculateTotalPrice() / quantity,
                        name: product.name,
                        imageUrl: product.images?.[0] || '',
                        customization: selectedOptions,
                        giftOption: giftDetails
                      });
                      router.push(user ? '/checkout' : '/cart');
                    } catch (err) {
                      alert("Failed to add to cart");
                      setIsAdding(false);
                    }
                  }}
                  disabled={isAdding}
                  className="w-full sm:flex-1 bg-brand-900 text-white font-black rounded-2xl py-4 md:py-5 px-5 md:px-8 hover:bg-brand-800 transition-all shadow-xl shadow-brand-900/10 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-75 relative overflow-hidden group"
                >
                  {isAdding ? <><Loader2 size={18} className="animate-spin" /> SYNCHRONIZING...</> : (
                    <div className="flex items-center gap-3 relative z-10">
                       <Gift size={18} />
                       <span className="uppercase text-[11px] sm:text-xs tracking-widest text-center">Express Checkout — ₹{calculateTotalPrice().toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </button>
                <button className="hidden sm:flex w-14 h-14 rounded-2xl border border-brand-200 items-center justify-center text-brand-600 hover:text-brand-500 hover:border-brand-500 hover:bg-brand-50 transition-all shrink-0">
                  <Heart size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4 mt-12">
                {faqs.map((acc, i) => (
                  <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} className="border border-brand-100 rounded-xl p-4 cursor-pointer hover:border-brand-300 transition-colors bg-white overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <acc.icon size={18} className={openFaq === i ? "text-brand-600" : "text-brand-500"} />
                        <span className={`font-heading font-medium ${openFaq === i ? "text-brand-900" : "text-brand-800"}`}>{acc.title}</span>
                      </div>
                      <span className="text-brand-400 font-medium text-lg transition-transform duration-300" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
                    </div>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <p className="pt-4 text-sm text-brand-600 leading-relaxed border-t border-brand-50 mt-4">{acc.content}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
