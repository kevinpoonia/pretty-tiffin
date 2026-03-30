'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Star, Truck, Heart, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
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
  }, []);
  
  // Simulated Carousel Timer
  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
      }, 5000);
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

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <Navbar alwaysSolid />
      
      <main className="w-full">
        {/* IGP Style Hero Carousel */}
        <section className="bg-white w-full overflow-hidden relative aspect-square md:aspect-[21/8]">
          <div 
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {banners.length > 0 ? banners.map((banner, idx) => (
              <div key={banner.id} className="w-full flex-shrink-0 h-full relative cursor-pointer">
                <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" priority={idx === 0} />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                  <div className="container mx-auto px-8 md:px-16 text-white text-left">
                    <h2 className="text-3xl md:text-5xl font-bold mb-2">{banner.title}</h2>
                    <p className="text-lg md:text-xl mb-6">{banner.subtitle}</p>
                    <Link href={banner.link || '/shop'} className="bg-red-500 hover:bg-red-600 px-8 py-3 rounded text-sm font-bold tracking-wide transition-colors">SHOP NOW</Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="w-full flex-shrink-0 h-full relative bg-gray-100 flex items-center justify-center">
                <Loader2 className="animate-spin text-red-500" size={32} />
              </div>
            )}
          </div>
          
          {/* Carousel Dots */}
          <div className="absolute bottom-4 w-full flex justify-center gap-2">
            {banners.map((_, dot) => (
              <button 
                key={dot}
                onClick={() => setCurrentSlide(dot)}
                className={`h-2 rounded-full transition-all ${currentSlide === dot ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>
        </section>

        {/* Circular Categories Grid */}
        <section className="bg-white py-10 shadow-sm mb-6">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Shop By Category</h2>
            <div className="flex overflow-x-auto pb-4 md:pb-0 md:flex-wrap md:justify-center gap-4 md:gap-10 snap-x no-scrollbar">
              {categories.map((cat, idx) => (
                <Link key={idx} href={`/shop?category=${cat.name}`} className="flex flex-col items-center group cursor-pointer w-24 md:w-32 flex-shrink-0 snap-center">
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-red-50 overflow-hidden relative mb-3 group-hover:shadow-lg transition-all border-2 border-transparent group-hover:border-red-500">
                    <Image src={cat.img} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500 p-2" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 text-center group-hover:text-red-500">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Gifts Container */}
        <section className="container mx-auto px-4 md:px-6 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Trending Personalized Gifts</h2>
            <Link href="/shop" className="text-red-500 font-semibold text-sm hover:underline">View All</Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-white rounded h-64 animate-pulse border border-gray-100" />
              ))
            ) : products.slice(0, 5).map((item, idx) => (
              <Link key={item.id} href={`/shop/${item.slug}`} className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow relative cursor-pointer block">
                {/* Product Image Area */}
                <div className="relative aspect-square bg-[#f9f9f9]">
                   {idx === 0 && <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 flex items-center gap-1 rounded-sm shadow-sm"><Truck size={10} /> Same Day</div>}
                   <button className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                     <Heart size={16} />
                   </button>
                   <Image 
                     src={item.images?.[0] || `/images/product-1.png`} 
                     alt={item.name} 
                     fill 
                     className="object-contain p-4 group-hover:scale-105 transition-transform bg-[#f9f9f9]" 
                   />
                </div>
                
                {/* Product Info */}
                <div className="p-3 border-t border-gray-100">
                   <h3 className="text-sm text-gray-700 font-medium line-clamp-2 leading-snug mb-2 group-hover:text-red-500 transition-colors">
                     {item.name}
                   </h3>
                   <div className="flex items-center gap-1 mb-2">
                     <div className="flex text-yellow-400">
                       <Star size={12} fill="currentColor" />
                       <Star size={12} fill="currentColor" />
                       <Star size={12} fill="currentColor" />
                       <Star size={12} fill="currentColor" />
                       <Star size={12} fill="currentColor" className="text-gray-300" />
                     </div>
                     <span className="text-xs text-gray-500">(1.2k)</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="font-bold text-gray-900">₹{item.price.toLocaleString('en-IN')}</span>
                     {item.compareAtPrice && <span className="text-xs text-gray-400 line-through">₹{item.compareAtPrice.toLocaleString('en-IN')}</span>}
                   </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Gifts By Relationship Grid (IGP Style) */}
        <section className="bg-white py-12 mb-10 shadow-sm border-y border-gray-200">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Gifts by Relationship</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relationships.map((rel, idx) => (
                <Link key={idx} href={`/shop?for=${rel.title}`} className="relative bg-gray-100 aspect-square md:aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer block">
                  <Image src={rel.img} alt={rel.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-6">
                    <h3 className="text-white font-bold text-lg md:text-xl group-hover:text-red-400 transition-colors">{rel.title}</h3>
                    <p className="text-white/80 text-sm mt-1 hidden md:block">Shop the collection <span>→</span></p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
