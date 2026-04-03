'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { Loader2, ChevronDown } from 'lucide-react';
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
          const [prodRes, bannerRes] = await Promise.all([
            api.get('/products'),
            api.get('/banners')
          ]);
          setProducts(prodRes.data);
          setBanners(bannerRes.data);
        } catch (err) {
          console.error("Failed to fetch home data", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [initialProducts.length]);
  
  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  const categories = Array.from(new Set(products.map(p => p.category))).map(cat => ({
    name: cat,
    img: products.find(p => p.category === cat)?.images?.[0] || '/images/product-1.png'
  })).slice(0, 6);

  const relationships = [
    { title: 'For Husband', img: '/images/hero.png' },
    { title: 'For Wife', img: '/images/feature-2.png' },
    { title: 'For Kids', img: '/images/feature-1.png' },
    { title: 'For Parents', img: '/images/gifting.png' },
  ];

  const faqs = [
    { q: "What is the best personalized gift for a husband in India?", a: "The best personalized gift is a high-quality, engraved stainless steel tiffin box. It combines practicality for work lunches with a sentimental touch that lasts a lifetime." },
    { q: "How long does shipping take for customized tiffins?", a: "We offer express shipping across India. Standard delivery takes 3-5 business days, while metro cities often receive orders within 48-72 hours." },
    { q: "Can I engrave a logo for corporate gifting?", a: "Yes, we specialize in corporate gifting. You can engrave individual names or company logos for a premium, sustainable branding experience." }
  ];

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <Navbar alwaysSolid />
      <main className="w-full">
        {/* Hero Carousel */}
        <section className="bg-white w-full overflow-hidden relative aspect-[4/5] sm:aspect-[16/10] xl:aspect-[21/8]">
          <div className="flex transition-transform duration-700 ease-in-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {banners.length > 0 ? banners.map((banner, idx) => (
              <div key={banner.id} className="w-full flex-shrink-0 h-full relative cursor-pointer">
                <Image 
                  src={banner.imageUrl} 
                  alt={banner.title} 
                  fill 
                  className="object-cover" 
                  priority={idx === 0}
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10 flex items-end sm:items-center">
                  <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 text-white text-left pb-10 sm:pb-0">
                    <div className="max-w-2xl">
                      <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 leading-tight">{banner.title}</h2>
                      <p className="text-sm sm:text-base md:text-xl mb-5 sm:mb-6 text-white/90 max-w-xl">{banner.subtitle}</p>
                      <Link href={banner.link || '/shop'} className="inline-flex bg-red-500 hover:bg-red-600 px-5 sm:px-8 py-3 rounded text-xs sm:text-sm font-bold tracking-wide transition-colors">
                        SHOP NOW
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="w-full flex-shrink-0 h-full relative bg-gray-100 flex items-center justify-center">
                <Loader2 className="animate-spin text-red-500" size={32} />
              </div>
            )}
          </div>
          <div className="absolute bottom-4 w-full flex justify-center gap-2">
            {banners.map((_, dot) => (
              <button key={dot} onClick={() => setCurrentSlide(dot)} className={`h-2 rounded-full transition-all ${currentSlide === dot ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} />
            ))}
          </div>
        </section>

        {/* Circular Categories */}
        <section className="bg-white py-8 md:py-10 shadow-sm mb-6 content-auto">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-6 md:mb-8">Shop By Category</h2>
            <div className="flex overflow-x-auto pb-4 md:pb-0 md:flex-wrap md:justify-center gap-4 md:gap-10 snap-x no-scrollbar">
              {categories.map((cat, idx) => (
                <Link key={idx} href={`/shop?category=${cat.name}`} className="flex flex-col items-center group cursor-pointer w-[5.5rem] sm:w-24 md:w-32 flex-shrink-0 snap-center">
                  <div className="w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full bg-red-50 overflow-hidden relative mb-3 group-hover:shadow-lg transition-all border-2 border-transparent group-hover:border-red-500">
                    <Image src={cat.img} alt={cat.name} fill sizes="(max-width: 768px) 80px, 112px" className="object-cover group-hover:scale-110 transition-transform duration-500 p-2" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-700 text-center group-hover:text-red-500">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Gifts */}
        <section className="container mx-auto px-4 md:px-6 mb-10 content-auto">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Trending Personalized Gifts</h2>
            <Link href="/shop" className="text-red-500 font-semibold text-sm hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100" />)
            ) : products.slice(0, 5).map((item, idx) => (
              <ProductCard key={item.id} product={item} showBadge={idx === 0} priority={idx < 2} />
            ))}
          </div>
        </section>

        {/* Relationships */}
        <section className="bg-white py-10 md:py-12 mb-10 shadow-sm border-y border-gray-200 content-auto">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-8">Gifts by Relationship</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-0 md:px-2">
              {relationships.map((rel, idx) => (
                <Link key={idx} href={`/shop?for=${rel.title}`} className="relative bg-gray-100 aspect-square md:aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer block">
                  <Image src={rel.img} alt={rel.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 md:p-6">
                    <h3 className="text-white font-bold text-base md:text-xl group-hover:text-red-400 transition-colors">{rel.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* AEO FAQ Section */}
        <section className="bg-[#f0f0f0] py-12 md:py-16 content-auto">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
             <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-8 md:mb-10">Frequently Asked Questions — Gifting Guide</h2>
             <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                     <button 
                       onClick={() => setOpenFaq(openFaq === i ? null : i)}
                       className="w-full flex items-center justify-between p-5 text-left"
                     >
                        <span className="font-bold text-gray-800 text-sm">{faq.q}</span>
                        <ChevronDown className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-180 text-red-500' : ''}`} size={18} />
                     </button>
                     {openFaq === i && (
                       <div className="p-5 pt-0 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
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
