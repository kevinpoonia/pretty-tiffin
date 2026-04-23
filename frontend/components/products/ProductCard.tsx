'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Truck, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    category: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
  };
  showBadge?: boolean;
  priority?: boolean;
}

export default function ProductCard({ product, showBadge = false, priority = false }: ProductCardProps) {
  const [currentImg, setCurrentImg] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const { showToast } = useToast();

  const images = product.images?.length > 0 ? product.images : ['/images/product-1.png'];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImg(prev => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImg(prev => (prev - 1 + images.length) % images.length);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(prev => !prev);
    showToast(wishlisted ? 'Removed from wishlist' : `${product.name} added to wishlist`, wishlisted ? 'info' : 'success');
  };

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-[2rem] organic-shape-1 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 border border-brand-100 flex flex-col h-full relative w-full hover:-translate-y-2"
    >
      <Link href={`/shop/${product.slug}`} className="block relative aspect-[4/5] bg-brand-50/50 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImg}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentImg]}
              alt={product.name}
              fill
              className="object-contain p-6 group-hover:scale-110 transition-transform duration-1000"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
            />
          </motion.div>
        </AnimatePresence>

        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {showBadge && (
            <span className="bg-brand-900 text-brand-100 text-[10px] font-bold px-3 py-1.5 flex items-center gap-2 rounded-full shadow-lg backdrop-blur-sm bg-opacity-90">
              <Truck size={10} /> PRIORITY
            </span>
          )}
          {discount && (
            <span className="bg-stone-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm bg-opacity-90">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 hover:bg-white text-stone-800 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all duration-500 hover:scale-110 active:scale-90"
          aria-label="Add to wishlist"
        >
          <Heart
            size={18}
            className={`transition-all duration-500 ${wishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-stone-400'}`}
          />
        </button>

        {/* Gallery Controls */}
        {images.length > 1 && (
          <div className={`absolute inset-x-0 bottom-4 flex items-center justify-between px-4 z-20 transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <button onClick={prevImage} className="w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-xl flex items-center justify-center text-stone-800 transition-all hover:scale-110">
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex gap-1.5 bg-white/60 backdrop-blur-md px-2 py-1.5 rounded-full">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-500 ${currentImg === idx ? 'w-4 bg-brand-900' : 'w-1 bg-brand-900/20'}`}
                />
              ))}
            </div>

            <button onClick={nextImage} className="w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-xl flex items-center justify-center text-stone-800 transition-all hover:scale-110">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </Link>

      <div className="p-6 flex-1 flex flex-col">
        <p className="text-[10px] text-brand-500 font-bold mb-2 uppercase tracking-[0.2em] line-clamp-1">
          {product.category}
        </p>
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-heading italic text-xl text-stone-800 mb-3 group-hover:text-brand-700 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mb-6">
          {[1, 2, 3, 4, 5].map(star => (
            <Star key={star} size={12} className="fill-brand-300 text-brand-300" />
          ))}
          <span className="text-[10px] text-stone-400 font-medium ml-1">4.9 (24)</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-5 border-t border-stone-50">
          <div className="flex flex-col">
            <span className="font-sans font-bold text-stone-900 text-lg">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-stone-400 line-through">
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <Link
            href={`/shop/${product.slug}`}
            className="bg-brand-900 text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-stone-800 transition-all duration-500 uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Personalize
          </Link>
        </div>
      </div>
    </motion.div>

  );
}
