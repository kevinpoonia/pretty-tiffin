'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { Loader2, ChevronDown, ChevronLeft, ChevronRight, Truck, Zap, PenTool, ShieldCheck, Medal, Sparkles, Box } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function HomeClient({ initialProducts, initialBanners }: { initialProducts: any[], initialBanners: any[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<any[]>(initialBanners);
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (initialProducts.length === 0) {
      const fetchData = async () => {
        try {
          const [prodRes, bannerRes] = await Promise.all([api.get('/products'), api.get('/banners')]);
          setProducts(prodRes.data);
          setBanners(bannerRes.data);
        } catch (err) {
          console.error('Failed to fetch home data', err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [initialProducts.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const prevSlide = () => setCurrentSlide(prev => (prev === 0 ? banners.length - 1 : prev - 1));
  const nextSlide = () => setCurrentSlide(prev => (prev === banners.length - 1 ? 0 : prev + 1));

  const categories = Array.from(new Set(products.map(p => p.category))).map(cat => ({
    name: cat,
    img: products.find(p => p.category === cat)?.images?.[0] || '/images/product-1.png',
  })).slice(0, 6);

  const relationships = [
    { title: 'For Husband', img: '/images/hero.png', href: '/shop?for=For Husband' },
    { title: 'For Wife', img: '/images/feature-2.png', href: '/shop?for=For Wife' },
    { title: 'For Kids', img: '/images/feature-1.png', href: '/shop?for=For Kids' },
    { title: 'For Parents', img: '/images/gifting.png', href: '/shop?for=For Parents' },
  ];

  const faqs = [
    { q: 'What makes a personalized tiffin the perfect gift?', a: 'A hand-engraved stainless steel tiffin box combines everyday utility with a personal touch that lasts a lifetime. It’s a thoughtful way to show you care, whether for office lunches or special celebrations.' },
    { q: 'How long does it take for my custom tiffin to arrive?', a: 'We handle every order with care. Standard international delivery takes 7-14 business days. Express shipping options are available at checkout for faster delivery.' },
    { q: 'Can I add a custom logo for a team gift?', a: 'Absolutely. We specialize in corporate gifting and can engrave individual names or company logos to create a premium, lasting impression for your team.' },
    { q: 'Is the engraving permanent?', a: 'Yes, our laser engraving process creates a permanent, high-precision mark on the steel. It will never fade, peel, or wash off, even with daily cleaning.' },
    { q: 'How should I clean and care for my engraved tiffin?', a: 'Our tiffins are made from high-grade 304 stainless steel. They are dishwasher safe, but we recommend hand-washing with a soft sponge to keep the finish looking brand new for years.' },
    { q: 'Do you ship worldwide?', a: 'Yes! We ship to customers in over 100 countries. Shipping charges are calculated at checkout based on your location and order size.' },
    { q: 'What is your return policy for customized items?', a: 'Since each piece is individually engraved for you, we can only accept returns if there is a manufacturing defect or damage during transit. Please reach out to our team within 48 hours of delivery if there is an issue.' },
  ];

  return (
    <div className="bg-[#f5f3ed] min-h-screen">
      <Navbar alwaysSolid />
      <main className="w-full">

        {/* Hero Carousel */}
        <section className="w-full overflow-hidden relative bg-gradient-to-br from-stone-100 via-white to-brand-100 aspect-[4/5] sm:aspect-[16/10] xl:aspect-[21/8]">
          <div
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {banners.length > 0 ? banners.map((banner, idx) => (
              <div key={banner.id || idx} className="w-full flex-shrink-0 h-full relative">
                <div className="absolute inset-0 bg-black/25 z-10" />
                <div className="absolute inset-0 p-3 sm:p-5 lg:p-8">
                  <div className="relative h-full w-full">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      fill
                      className="object-contain object-center sm:object-right"
                      priority={idx === 0}
                      quality={90}
                      sizes="100vw"
                    />
                  </div>
                </div>
                <div className="absolute inset-0 z-20 flex items-end sm:items-center">
                  <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 text-white text-left pb-6 sm:pb-0">
                    <div className="max-w-xs sm:max-w-md md:max-w-xl rounded-[1rem] sm:rounded-[1.5rem] bg-black/25 p-4 sm:p-6 md:p-9 backdrop-blur-[3px] shadow-2xl">
                      <h2 className="text-xl sm:text-3xl md:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 leading-tight">{banner.title}</h2>
                      <p className="text-xs sm:text-sm md:text-base mb-4 sm:mb-5 text-white/85 max-w-sm sm:max-w-md line-clamp-3">{banner.subtitle}</p>
                      <Link
                        href={banner.link || '/shop'}
                        className="inline-flex items-center bg-brand-100 text-brand-900 hover:bg-white px-5 sm:px-8 md:px-10 py-2.5 sm:py-3.5 rounded-full text-[10px] sm:text-xs font-bold tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95"
                      >
                        DISCOVER COLLECTION <ChevronRight size={14} className="ml-2" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="w-full flex-shrink-0 h-full bg-brand-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-500" size={32} />
              </div>
            )}
          </div>

          {/* Carousel Controls */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all border border-white/20"
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all border border-white/20"
                aria-label="Next slide"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Dot Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 w-full flex justify-center gap-2 z-30">
              {banners.map((_, dot) => (
                <button
                  key={dot}
                  onClick={() => setCurrentSlide(dot)}
                  className={`h-2 rounded-full transition-all ${currentSlide === dot ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'}`}
                  aria-label={`Go to slide ${dot + 1}`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Trust Badges */}
        <section className="bg-brand-500 py-4 sm:py-6 relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-0 md:flex md:flex-wrap md:justify-around items-center text-brand-50 font-semibold tracking-[0.15em]">
              {[
                { icon: <Truck size={18} />, text: 'Worldwide Shipping' },
                { icon: <Zap size={18} />, text: 'Fast Dispatch' },
                { icon: <PenTool size={18} />, text: 'Laser Engraved' },
                { icon: <ShieldCheck size={18} />, text: '100% Secure Payments' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <span className="text-brand-300 shrink-0">{badge.icon}</span>
                  <span className="uppercase tracking-widest text-[10px] sm:text-[11px]">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shop By Category */}
        <section className="bg-white py-16 md:py-20 relative border-b border-brand-100">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-5xl text-center text-stone-800 mb-12 uppercase tracking-widest">
              Browse by Category
            </h2>
            <div className="flex overflow-x-auto pb-4 md:pb-0 md:flex-wrap md:justify-center gap-8 md:gap-14 no-scrollbar snap-x">
              {categories.length > 0 ? categories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="flex flex-col items-center group cursor-pointer w-[5rem] sm:w-28 md:w-32 flex-shrink-0 snap-center"
                >
                  <div className={`w-[4.5rem] h-[4.5rem] sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-brand-50 overflow-hidden relative mb-4 transition-all duration-700 border border-brand-100 group-hover:border-brand-500 shadow-sm`}>
                    <Image src={cat.img} alt={cat.name} fill sizes="(max-width: 768px) 80px, 120px" className="object-cover group-hover:scale-110 transition-transform duration-700 p-2" />
                  </div>
                  <span className="text-xs font-bold text-stone-600 text-center group-hover:text-brand-700 transition-colors tracking-widest uppercase">{cat.name}</span>
                </Link>
              )) : ['Personalized', 'Corporate', 'Birthday', 'Anniversary', 'Wedding', 'Occasions'].map((cat, i) => (
                <Link key={i} href={`/shop?category=${cat.toLowerCase()}`} className="flex flex-col items-center group cursor-pointer w-[5rem] flex-shrink-0">
                  <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-brand-50 mb-4 overflow-hidden relative border border-brand-100 shadow-sm animate-pulse">
                     <Image src="/images/category-placeholder.png" alt="Loading category" fill className="object-cover opacity-50" />
                  </div>
                  <span className="text-xs font-semibold text-stone-400">{cat}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Products */}
        <section className="container mx-auto px-4 md:px-6 py-12 mb-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl text-stone-800 mb-2 font-heading italic">Trending Treasures</h2>
              <p className="text-sm text-stone-500 font-medium italic">Handpicked artisanal gifts loved across the country</p>
            </div>
            <Link href="/shop" className="text-brand-700 font-bold text-xs uppercase tracking-widest hover:text-brand-900 border-b-2 border-brand-200 pb-1 transition-all">View All Collections</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="bg-white h-80 animate-pulse border border-brand-50 rounded-2xl" />)
            ) : products.slice(0, 5).map((item, idx) => (
              <ProductCard key={item.id} product={item} showBadge={idx === 0} priority={idx < 2} />
            ))}
          </div>
        </section>

        {/* Gifts by Relationship */}
        <section className="bg-brand-50 py-16 md:py-24 border-y border-brand-100">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <h2 className="text-3xl md:text-5xl text-center text-stone-800 mb-16 uppercase tracking-widest">Curated for Loved Ones</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
              {relationships.map((rel, idx) => (
                <Link
                  key={idx}
                  href={rel.href}
                  className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden group cursor-pointer block rounded-none transition-all duration-700 bg-white"
                >
                  <Image src={rel.img} alt={rel.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.2] group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-stone-900/40 group-hover:bg-stone-900/20 transition-colors flex flex-col justify-end p-6 md:p-8">
                    <h3 className="text-white text-xl md:text-2xl mb-2 font-heading tracking-wide uppercase">{rel.title}</h3>
                    <p className="text-brand-50 text-[10px] font-bold uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">Explore Collection →</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Strip */}
        <section className="container mx-auto px-4 md:px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
            {[
              { icon: <Medal size={28} />, title: 'Premium Quality', desc: 'Food-grade 304 stainless steel, built to last decades.' },
              { icon: <Sparkles size={28} />, title: 'Personalized for You', desc: 'Laser-engraved names, dates, and custom messages.' },
              { icon: <Box size={28} />, title: 'Gift-Ready Packaging', desc: 'Arrives in premium gift packaging, perfect for gifting.' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-brand-100 shadow-sm flex flex-col items-center text-center gap-4 hover:shadow-md transition-shadow">
                <span className="text-brand-500 mb-2">{f.icon}</span>
                <div>
                  <h3 className="text-xl font-heading italic text-stone-800 mb-2">{f.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed max-w-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white py-12 md:py-16 relative">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <h2 className="text-3xl md:text-5xl text-center text-stone-800 mb-12 italic font-heading">Curiosities & Answers</h2>
            <div className="grid grid-cols-1 gap-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-stone-100 last:border-0">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-5 text-left group"
                  >
                    <span className={`text-base md:text-lg transition-all duration-300 ${openFaq === i ? 'text-brand-700 italic font-medium' : 'text-stone-700'}`}>{faq.q}</span>
                    <div className={`w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center transition-all duration-500 ${openFaq === i ? 'rotate-180 bg-brand-700 border-brand-700 text-white' : 'group-hover:border-stone-400'}`}>
                      <ChevronDown size={14} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-5 text-sm text-stone-500 leading-relaxed max-w-3xl">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
