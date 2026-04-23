'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { Loader2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
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
    { q: 'What is the best personalized gift for a husband in India?', a: 'The best personalized gift is a high-quality, engraved stainless steel tiffin box. It combines practicality for work lunches with a sentimental touch that lasts a lifetime.' },
    { q: 'How long does shipping take for customized tiffins?', a: 'We offer express shipping across India. Standard delivery takes 3-5 business days, while metro cities often receive orders within 48-72 hours.' },
    { q: 'Can I engrave a logo for corporate gifting?', a: 'Yes, we specialize in corporate gifting. You can engrave individual names or company logos for a premium, sustainable branding experience.' },
  ];

  return (
    <div className="bg-[#fdfaf6] min-h-screen selection:bg-brand-200 selection:text-brand-900">
      <Navbar alwaysSolid />
      <main className="w-full">

        {/* Hero Carousel */}
        <section className="w-full overflow-hidden relative bg-gradient-to-br from-stone-100 via-white to-brand-50 aspect-[4/5] sm:aspect-[16/10] xl:aspect-[21/8]">
          <div
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {banners.length > 0 ? banners.map((banner, idx) => (
              <div key={banner.id || idx} className="w-full flex-shrink-0 h-full relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1f1513]/70 via-[#1f1513]/30 to-transparent z-10" />
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
                  <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 text-white text-left pb-10 sm:pb-0">
                    <div className="max-w-xl rounded-[2rem] organic-shape-1 bg-brand-900/40 p-8 sm:p-10 md:p-12 backdrop-blur-md shadow-2xl border border-white/10">
                      <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading italic text-white mb-4 leading-tight">{banner.title}</h2>
                      <p className="text-sm sm:text-base md:text-xl mb-8 text-white/90 font-sans max-w-md leading-relaxed">{banner.subtitle}</p>
                      <Link
                        href={banner.link || '/shop'}
                        className="inline-flex items-center bg-brand-100 text-brand-900 hover:bg-white px-8 sm:px-10 py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95"
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
        <section className="bg-brand-900 py-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />
          </div>
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-wrap justify-center md:justify-around items-center gap-y-4 gap-x-10 text-brand-100 text-[11px] sm:text-xs font-medium tracking-[0.2em]">
              {[
                { icon: '🚚', text: 'Complimentary Shipping' },
                { icon: '⚡', text: 'Express Priority Delivery' },
                { icon: '✏️', text: 'Artisanal Laser Engraving' },
                { icon: '🔒', text: 'Secured Checkout' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <span className="text-lg grayscale group-hover:grayscale-0 transition-all duration-500">{badge.icon}</span>
                  <span className="uppercase">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shop By Category */}
        <section className="bg-white py-16 md:py-20 relative">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl text-center text-stone-800 mb-12">
              <span className="ink-underline">Browse by Category</span>
            </h2>
            <div className="flex overflow-x-auto pb-4 md:pb-0 md:flex-wrap md:justify-center gap-8 md:gap-14 no-scrollbar snap-x">
              {categories.length > 0 ? categories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="flex flex-col items-center group cursor-pointer w-[5rem] sm:w-28 md:w-32 flex-shrink-0 snap-center"
                >
                  <div className={`w-[4.5rem] h-[4.5rem] sm:w-24 sm:h-24 md:w-28 md:h-28 ${idx % 2 === 0 ? 'organic-shape-1' : 'organic-shape-2'} bg-brand-50 overflow-hidden relative mb-4 group-hover:shadow-2xl transition-all duration-700 border border-brand-100 group-hover:border-brand-300 group-hover:-translate-y-2`}>
                    <Image src={cat.img} alt={cat.name} fill sizes="(max-width: 768px) 80px, 120px" className="object-cover group-hover:scale-110 transition-transform duration-700 p-3" />
                  </div>
                  <span className="text-xs font-bold text-stone-600 text-center group-hover:text-brand-700 transition-colors tracking-wide">{cat.name}</span>
                </Link>
              )) : ['Personalized', 'Corporate', 'Birthday', 'Anniversary', 'Wedding', 'Occasions'].map((cat, i) => (
                <Link key={i} href={`/shop?category=${cat.toLowerCase()}`} className="flex flex-col items-center group cursor-pointer w-[5rem] flex-shrink-0">
                  <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-brand-50 mb-4 animate-pulse" />
                  <span className="text-xs font-semibold text-stone-400">{cat}</span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Wavy Separator */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] translate-y-[99%] z-10 text-brand-50">
            <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 48H1440V0C1350 0 1260 24 1170 24C1080 24 990 0 900 0C810 0 720 24 630 24C540 24 450 0 360 0C270 0 180 24 90 24C45 24 0 12 0 12V48Z" fill="currentColor"/>
            </svg>
          </div>
        </section>

        {/* Trending Products */}
        <section className="container mx-auto px-4 md:px-6 py-16 mb-8">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl text-stone-800 mb-2">Trending Treasures</h2>
              <p className="text-sm text-stone-500 font-medium italic">Handpicked artisanal gifts loved across the country</p>
            </div>
            <Link href="/shop" className="text-brand-700 font-bold text-xs uppercase tracking-widest hover:text-brand-900 border-b-2 border-brand-200 pb-1 transition-all">View All Collections</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="bg-white organic-shape-1 h-80 animate-pulse border border-brand-50" />)
            ) : products.slice(0, 5).map((item, idx) => (
              <ProductCard key={item.id} product={item} showBadge={idx === 0} priority={idx < 2} />
            ))}
          </div>
        </section>

        {/* Gifts by Relationship */}
        <section className="bg-brand-50 py-20 md:py-28 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] -translate-y-[1px] rotate-180 text-white">
            <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 48H1440V0C1350 0 1260 24 1170 24C1080 24 990 0 900 0C810 0 720 24 630 24C540 24 450 0 360 0C270 0 180 24 90 24C45 24 0 12 0 12V48Z" fill="currentColor"/>
            </svg>
          </div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <h2 className="text-3xl md:text-5xl text-center text-stone-800 mb-16">Curated for Loved Ones</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
              {relationships.map((rel, idx) => (
                <Link
                  key={idx}
                  href={rel.href}
                  className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden group cursor-pointer block rounded-[2.5rem] organic-shape-1 shadow-lg hover:shadow-2xl transition-all duration-700 bg-white"
                >
                  <Image src={rel.img} alt={rel.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.2] group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent flex flex-col justify-end p-6 md:p-8">
                    <h3 className="text-white italic text-xl md:text-2xl mb-2">{rel.title}</h3>
                    <p className="text-brand-200 text-[10px] font-bold uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">Explore →</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] translate-y-[1px] text-white">
            <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 48H1440V0C1350 0 1260 24 1170 24C1080 24 990 0 900 0C810 0 720 24 630 24C540 24 450 0 360 0C270 0 180 24 90 24C45 24 0 12 0 12V48Z" fill="currentColor"/>
            </svg>
          </div>
        </section>

        {/* Features Strip */}
        <section className="container mx-auto px-4 md:px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
            {[
              { icon: '🏅', title: 'Heritage Quality', desc: 'Sustainably sourced 304 stainless steel, designed to be passed down through generations.' },
              { icon: '✨', title: 'Truly Personal', desc: 'Hand-guided laser engraving for a unique, soulful finish on every piece.' },
              { icon: '📦', title: 'Artisan Packaging', desc: 'Delivered in hand-finished sustainable packaging, ready for the most special moments.' },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 organic-shape-2 bg-brand-100 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-500">
                  {f.icon}
                </div>
                <h3 className="text-xl italic text-stone-800 mb-3">{f.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed max-w-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white py-24 md:py-32 relative">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <h2 className="text-3xl md:text-5xl text-center text-stone-800 mb-16 italic">Curiosities & Answers</h2>
            <div className="grid grid-cols-1 gap-6">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-stone-100 last:border-0">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-8 text-left group"
                  >
                    <span className={`text-lg md:text-xl transition-all duration-300 ${openFaq === i ? 'text-brand-700 italic' : 'text-stone-700'}`}>{faq.q}</span>
                    <div className={`w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center transition-all duration-500 ${openFaq === i ? 'rotate-180 bg-brand-700 border-brand-700 text-white' : 'group-hover:border-stone-400'}`}>
                      <ChevronDown size={16} />
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
                        <div className="pb-8 text-base text-stone-500 leading-relaxed max-w-3xl">
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
