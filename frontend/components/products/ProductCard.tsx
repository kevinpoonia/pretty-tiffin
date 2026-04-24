'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, Heart, Sparkles } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';

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
  const currentImg = 0;
  const [isHovered, setIsHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const { showToast } = useToast();

  const images = product.images?.length > 0 ? product.images : ['/images/product-1.png'];

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !wishlisted;
    setWishlisted(next);
    showToast(next ? `${product.name} added to wishlist` : 'Removed from wishlist', next ? 'success' : 'info');
    try {
      if (next) {
        await api.post(`/user/wishlist/${product.id}`);
      } else {
        await api.delete(`/user/wishlist/${product.id}`);
      }
    } catch {
      setWishlisted(!next);
    }
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
      className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(42,61,37,0.12)] transition-all duration-700 border border-stone-100/60 flex flex-col h-full relative w-full hover:-translate-y-2"
    >
      <Link href={`/shop/${product.slug}`} className="block relative aspect-square bg-[#fcfaf7] overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={isHovered && images.length > 1 ? images[1] : images[currentImg]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center p-8"
          >
            <Image
              src={isHovered && images.length > 1 ? images[1] : images[currentImg]}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-1000 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
            />
          </motion.div>
        </AnimatePresence>

        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {showBadge && (
            <span className="bg-brand-900/90 text-brand-50 text-[9px] font-bold px-3 py-1.5 flex items-center gap-2 rounded-full shadow-lg backdrop-blur-md uppercase tracking-widest border border-white/20">
              <Sparkles size={10} className="text-brand-300" /> Essential
            </span>
          )}
          {discount && (
            <span className="bg-stone-800/90 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md uppercase tracking-widest border border-white/20">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 hover:scale-110 active:scale-90 ${wishlisted ? 'bg-white' : 'bg-white/60 hover:bg-white backdrop-blur-md border border-white/30'}`}
          aria-label="Add to wishlist"
        >
          <Heart
            size={18}
            className={`transition-all duration-500 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-stone-400'}`}
          />
        </button>

        {/* Image Navigator (Small Dots) */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {images.slice(0, 4).map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-500 ${currentImg === idx ? 'w-4 bg-brand-600' : 'w-1 bg-brand-600/20'}`}
              />
            ))}
          </div>
        )}
      </Link>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="px-2 py-0.5 rounded bg-brand-50 border border-brand-100">
            <p className="text-[9px] text-brand-700 font-bold uppercase tracking-[0.1em]">
              {product.category}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-brand-400 text-brand-400" />
            <span className="text-[10px] text-stone-500 font-bold">4.9</span>
          </div>
        </div>
        
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-heading italic text-xl text-stone-800 mb-4 group-hover:text-brand-900 transition-colors line-clamp-2 leading-snug min-h-[3rem]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between pt-5 border-t border-stone-50">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-sans font-bold text-stone-900 text-xl">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-stone-300 line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-brand-600 font-bold text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
              Explore <ChevronRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </motion.div>

  );
}
