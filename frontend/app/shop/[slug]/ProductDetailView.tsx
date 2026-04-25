'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Star, ShieldCheck, Truck, Info, Loader2, Gift, MessageSquare, Send, ThumbsUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProductCustomizer from '@/components/products/ProductCustomizer';
import GiftSelector from '@/components/products/GiftSelector';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';

export default function ProductDetailClient({ product }: { product: any }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
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
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/products/${product.slug}/reviews`).then((r) => {
      setReviews(r.data.reviews || []);
      setAvgRating(r.data.avgRating || 0);
      setReviewsTotal(r.data.total || 0);
    }).catch(() => {});
  }, [product.slug]);

  const submitReview = async () => {
    if (!newRating) { showToast('Please select a star rating', 'error'); return; }
    if (!user) { showToast('Please log in to leave a review', 'error'); router.push('/login'); return; }
    setSubmitting(true);
    try {
      const r = await api.post(`/products/${product.slug}/reviews`, { rating: newRating, comment: newComment });
      setReviews(prev => [r.data, ...prev]);
      setReviewsTotal(prev => prev + 1);
      setAvgRating(prev => Math.round(((prev * (reviewsTotal) + newRating) / (reviewsTotal + 1)) * 10) / 10);
      setNewRating(0);
      setNewComment('');
      showToast('Review submitted. Thank you!', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
            {/* Left: Product Images — sticky column */}
            <div className="w-full lg:w-1/2 lg:self-start lg:sticky lg:top-32 flex flex-col gap-4">
              <div className="relative aspect-square w-full rounded-[3rem] organic-shape-1 overflow-hidden bg-brand-50/50 flex items-center justify-center p-8 shadow-2xl border border-brand-100 group">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] pointer-events-none" />
                {product.images?.[0] ? (
                  <div className="relative w-full h-full">
                     <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-8 group-hover:scale-105 transition-transform duration-1000 z-10" />
                     <AnimatePresence>
                        {selectedOptions['Engraving'] && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none mix-blend-overlay opacity-50"
                          >
                             <p className="font-heading italic font-bold text-3xl text-black select-none tracking-widest uppercase">
                               {selectedOptions['Engraving']}
                             </p>
                          </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    layout
                    className={`relative w-72 h-96 rounded-[3rem] organic-shape-2 shadow-2xl flex flex-col items-center justify-center transition-all duration-700 ${getTiffinColor()}`}
                  >
                    <div className="absolute top-1/3 w-full h-[1px] bg-black/5" />
                    <div className="absolute top-2/3 w-full h-[1px] bg-black/5" />
                    <AnimatePresence mode="popLayout">
                      {selectedOptions['Engraving'] && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] text-center mix-blend-overlay"
                        >
                          <p className="font-heading italic font-bold text-3xl text-black/40 tracking-wider">
                            {selectedOptions['Engraving']}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
              {/* Thumbnails */}
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-1 no-scrollbar">
                {product.images?.map((thumb: string, i: number) => (
                  <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand-50 flex-shrink-0 cursor-pointer border-2 border-transparent hover:border-brand-500 transition-all relative overflow-hidden shadow-sm">
                    <Image src={thumb} alt={product.name} fill sizes="80px" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Product Info & Configurator */}
            <div className="w-full lg:w-1/2 flex flex-col pt-0 lg:pt-4">
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center text-brand-300">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} className="fill-brand-300" />)}
                  </div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Crafted for Excellence — 42 Reviews</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading italic text-stone-800 mb-6 leading-tight">{product.name}</h1>
                <div className="flex flex-wrap items-center gap-6">
                   <p className="text-3xl font-sans font-bold text-stone-900">₹{Number(product.price).toLocaleString('en-IN')}</p>
                   {product.compareAtPrice && <p className="text-xl text-stone-300 line-through font-medium">₹{Number(product.compareAtPrice).toLocaleString('en-IN')}</p>}
                   <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-brand-100">Artisanal Stock</span>
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

              <div className="mt-10 md:mt-14 bg-white/80 backdrop-blur-2xl p-6 rounded-[2.5rem] organic-shape-1 border border-brand-50 shadow-2xl flex flex-col sm:flex-row gap-6 z-20 2xl:sticky 2xl:bottom-10">
                <div className="flex items-center border border-brand-100 rounded-full bg-brand-50/50 overflow-hidden w-full sm:w-40 shrink-0 h-16">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-6 h-full text-stone-500 hover:text-brand-900 transition-all font-bold text-xl">-</button>
                  <span className="flex-1 text-center font-bold text-base text-stone-800">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-6 h-full text-stone-500 hover:text-brand-900 transition-all font-bold text-xl">+</button>
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
                      showToast(`${product.name} added to cart!`, 'success');
                      router.push(user ? '/checkout' : '/cart');
                    } catch (err) {
                      showToast('Failed to add to cart. Please try again.', 'error');
                      setIsAdding(false);
                    }
                  }}
                  disabled={isAdding}
                  className="w-full sm:flex-1 bg-brand-900 text-white font-bold rounded-full py-5 px-10 hover:bg-stone-800 transition-all duration-700 shadow-2xl shadow-brand-900/20 flex items-center justify-center gap-4 cursor-pointer disabled:opacity-75 hover:scale-105 active:scale-95"
                >
                  {isAdding ? <><Loader2 size={20} className="animate-spin" /> CRAFTING...</> : (
                    <div className="flex items-center gap-4">
                       <Gift size={20} />
                       <span className="uppercase text-[11px] font-bold tracking-[0.2em]">Personalize Now — ₹{calculateTotalPrice().toLocaleString('en-IN')}</span>
                    </div>
                  )}
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

        {/* Reviews Section */}
        <div className="mt-20 border-t border-brand-50 pt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading italic text-stone-800 mb-2">Customer Reviews</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={16} className={s <= Math.round(avgRating) ? 'fill-brand-400 text-brand-400' : 'text-brand-200 fill-brand-200'} />
                  ))}
                </div>
                <span className="font-bold text-stone-700">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</span>
                <span className="text-sm text-stone-400">({reviewsTotal} review{reviewsTotal !== 1 ? 's' : ''})</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Write a review */}
            <div className="bg-brand-50/50 rounded-[2rem] border border-brand-100 p-6 h-fit">
              <h3 className="font-heading italic text-xl text-stone-800 mb-5">Write a Review</h3>
              <div className="flex items-center gap-2 mb-5">
                {[1,2,3,4,5].map(s => (
                  <button
                    key={s}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setNewRating(s)}
                    className="transition-transform hover:scale-125 active:scale-95"
                  >
                    <Star size={28} className={(hoverRating || newRating) >= s ? 'fill-brand-400 text-brand-400' : 'text-stone-200 fill-stone-200'} />
                  </button>
                ))}
                <span className="ml-2 text-sm text-stone-500 font-medium">
                  {newRating === 1 ? 'Poor' : newRating === 2 ? 'Fair' : newRating === 3 ? 'Good' : newRating === 4 ? 'Very Good' : newRating === 5 ? 'Excellent' : 'Select rating'}
                </span>
              </div>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                className="w-full border border-brand-100 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:border-brand-300 resize-none bg-white"
              />
              <button
                onClick={submitReview}
                disabled={submitting}
                className="mt-4 w-full bg-brand-900 text-white font-bold py-3 rounded-full hover:bg-stone-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><MessageSquare size={16} /> Submit Review</>}
              </button>
            </div>

            {/* Review list */}
            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ThumbsUp size={40} className="text-brand-200 mb-4" />
                  <p className="text-stone-400 text-sm">No reviews yet. Be the first!</p>
                </div>
              ) : reviews.map((review: any) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-brand-50 rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-stone-800 text-sm">{review.user?.name || 'Verified Buyer'}</p>
                      <p className="text-xs text-stone-400">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} className={s <= review.rating ? 'fill-brand-400 text-brand-400' : 'text-stone-200 fill-stone-200'} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-stone-600 leading-relaxed">{review.comment}</p>}
                  {review.isVerified && (
                    <span className="inline-flex items-center gap-1 mt-3 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                      <Send size={8} /> Verified Purchase
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
