import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Star, ShieldCheck, Heart, Truck, Check, Share2, Info, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [activeColor, setActiveColor] = useState('Classic Steel');
  const [engravingText, setEngravingText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    api.get(`/products/${params.slug}`).then(res => {
      setProduct(res.data);
      if (res.data.images?.length > 0) {
        // Optional: set initial active image or color if needed
      }
    }).catch(err => {
      console.error("Product not found", err);
    }).finally(() => setLoading(false));
  }, [params.slug]);

  const faqs = [
    { title: "Product Features & Specs", icon: Info, content: "Made from premium 304 food-grade stainless steel. Features a space-saving stacking design. Dimensions: 14cm x 14cm x 22cm when fully assembled." },
    { title: "Shipping & Delivery", icon: Truck, content: "Free express shipping across India. Orders placed before 1 PM are eligible for Same Day Delivery in select metro cities. Standard delivery takes 2-4 business days." },
    { title: "Warranty Information", icon: ShieldCheck, content: "Enjoy peace of mind with our 1-year manufacturer warranty. Covers structural defects, clip malfunctions, and transit damages." },
  ];

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-2xl font-bold text-brand-900 mb-4">Product Not Found</h1>
        <Link href="/shop" className="text-brand-500 font-bold underline">Back to Shop</Link>
      </div>
    );
  }

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
                {product.images?.[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill className="object-contain p-12" />
                ) : (
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
                )}
              </div>
              
              {/* Thumbnails */}
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images?.map((thumb: string, i: number) => (
                  <div key={i} className="w-20 h-20 rounded-xl bg-brand-100 flex-shrink-0 cursor-pointer border-2 border-transparent hover:border-brand-500 transition-colors relative overflow-hidden">
                    <Image src={thumb} alt={product.name} fill className="object-cover" />
                  </div>
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
                <h1 className="text-3xl md:text-4xl font-bold font-heading text-brand-900 mb-2">{product.name}</h1>
                <p className="text-2xl font-semibold text-brand-900">₹{Number(product.price).toLocaleString('en-IN')}</p>
              </div>

              <p className="text-brand-700 leading-relaxed mb-8">
                {product.description}
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
                      productId: product.id,
                      quantity,
                      price: Number(product.price),
                      name: product.name,
                      imageUrl: product.images?.[0] || '',
                      customization: { engravingText, themeId: activeColor }
                    });
                    setIsAdding(false);
                    window.location.href = '/cart'; // Redirect to cart smoothly
                  }}
                  disabled={isAdding}
                  className="w-full sm:flex-1 bg-brand-900 text-white font-medium rounded-full py-4 px-8 hover:bg-brand-800 transition-all shadow-xl shadow-brand-900/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isAdding ? <><Loader2 size={18} className="animate-spin" /> ADDING TO CART...</> : `Add to Cart — ₹${(Number(product.price) * quantity).toLocaleString('en-IN')}`}
                </button>
                
                <button className="w-14 h-14 rounded-full border border-brand-200 flex items-center justify-center text-brand-600 hover:text-brand-500 hover:border-brand-500 hover:bg-brand-50 transition-all shrink-0">
                  <Heart size={20} />
                </button>
              </div>

              {/* Accordions */}
              <div className="flex flex-col gap-4">
                {faqs.map((acc, i) => (
                  <div 
                    key={i} 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="border border-brand-100 rounded-xl p-4 cursor-pointer hover:border-brand-300 transition-colors bg-white overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <acc.icon size={18} className={openFaq === i ? "text-brand-600" : "text-brand-500"} />
                        <span className={`font-heading font-medium ${openFaq === i ? "text-brand-900" : "text-brand-800"}`}>{acc.title}</span>
                      </div>
                      <span className="text-brand-400 font-medium text-lg transition-transform duration-300" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
                    </div>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="pt-4 text-sm text-brand-600 leading-relaxed border-t border-brand-50 mt-4">
                            {acc.content}
                          </p>
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
import Link from 'next/link';
import Image from 'next/image';
