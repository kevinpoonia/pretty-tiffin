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
    <div className="bg-[#faf8f4] min-h-screen">
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
                    <div className="max-w-xl rounded-[1.5rem] bg-black/25 p-5 sm:p-7 md:p-9 backdrop-blur-[3px] shadow-2xl">
                      <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 leading-tight">{banner.title}</h2>
                      <p className="text-sm sm:text-base md:text-lg mb-5 text-white/85 max-w-md">{banner.subtitle}</p>
                      <Link
                        href={banner.link || '/shop'}
                        className="inline-flex items-center bg-brand-500 hover:bg-brand-600 px-6 sm:px-8 py-3 rounded-lg text-xs sm:text-sm font-bold tracking-wider transition-colors shadow-lg"
                      >
                        SHOP NOW <ChevronRight size={14} className="ml-1" />
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
        <section className="bg-brand-900 py-4">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-wrap justify-center md:justify-around items-center gap-y-3 gap-x-6 text-brand-200 text-[10px] sm:text-xs font-semibold">
              {[
                { icon: '🚚', text: 'Free Shipping on All Orders' },
                { icon: '⚡', text: 'Same Day Delivery Available' },
                { icon: '✏️', text: 'Laser Engraved Personalization' },
                { icon: '🔒', text: '100% Secure Payments' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-base">{badge.icon}</span>
                  <span className="uppercase tracking-wide">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shop By Category */}
        <section className="bg-white py-10 md:py-12 shadow-sm mb-6">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-8">Shop By Category</h2>
            <div className="flex overflow-x-auto pb-2 md:pb-0 md:flex-wrap md:justify-center gap-5 md:gap-10 no-scrollbar snap-x">
              {categories.length > 0 ? categories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="flex flex-col items-center group cursor-pointer w-[4.5rem] sm:w-24 md:w-28 flex-shrink-0 snap-center"
                >
                  <div className="w-[3.75rem] h-[3.75rem] sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-brand-50 overflow-hidden relative mb-3 group-hover:shadow-lg transition-all border-2 border-transparent group-hover:border-brand-500">
                    <Image src={cat.img} alt={cat.name} fill sizes="(max-width: 768px) 60px, 96px" className="object-cover group-hover:scale-110 transition-transform duration-500 p-2" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-700 text-center group-hover:text-brand-500 transition-colors leading-tight">{cat.name}</span>
                </Link>
              )) : ['Personalized', 'Corporate', 'Birthday', 'Anniversary', 'Wedding', 'Occasions'].map((cat, i) => (
                <Link key={i} href={`/shop?category=${cat.toLowerCase()}`} className="flex flex-col items-center group cursor-pointer w-[4.5rem] flex-shrink-0">
                  <div className="w-[3.75rem] h-[3.75rem] rounded-full bg-brand-100 mb-3 border-2 border-transparent animate-pulse" />
                  <span className="text-[10px] font-semibold text-gray-600">{cat}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Products */}
        <section className="container mx-auto px-4 md:px-6 mb-12">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Trending Personalized Gifts</h2>
              <p className="text-xs text-gray-500 mt-0.5">Handpicked bestsellers loved across India</p>
            </div>
            <Link href="/shop" className="text-brand-500 font-semibold text-sm hover:underline shrink-0">View All</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100" />)
            ) : products.slice(0, 5).map((item, idx) => (
              <ProductCard key={item.id} product={item} showBadge={idx === 0} priority={idx < 2} />
            ))}
          </div>
        </section>

        {/* Gifts by Relationship */}
        <section className="bg-white py-10 md:py-14 mb-10 border-y border-gray-100">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-8">Gifts by Relationship</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relationships.map((rel, idx) => (
                <Link
                  key={idx}
                  href={rel.href}
                  className="relative bg-gray-100 aspect-[3/4] md:aspect-square rounded-2xl overflow-hidden group cursor-pointer block"
                >
                  <Image src={rel.img} alt={rel.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-4 md:p-5">
                    <h3 className="text-white font-bold text-base md:text-lg group-hover:text-brand-300 transition-colors">{rel.title}</h3>
                    <p className="text-white/70 text-xs mt-0.5 font-medium">Shop Now →</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Strip */}
        <section className="container mx-auto px-4 md:px-6 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: '🏅', title: 'Premium Quality', desc: 'Food-grade 304 stainless steel, built to last decades.' },
              { icon: '✨', title: 'Personalized for You', desc: 'Laser-engraved names, dates, and custom messages.' },
              { icon: '📦', title: 'Gift-Ready Packaging', desc: 'Arrives in premium gift packaging, perfect for gifting.' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                <span className="text-3xl shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-brand-50 py-12 md:py-16 border-t border-brand-100">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 text-sm pr-4">{faq.q}</span>
                    <ChevronDown className={`text-gray-400 transition-transform shrink-0 ${openFaq === i ? 'rotate-180 text-brand-500' : ''}`} size={18} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                      {faq.a}
                    </div>
                  )}
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
