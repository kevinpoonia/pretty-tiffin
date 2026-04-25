'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, Heart, Sparkles } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useCurrency } from '@/context/CurrencyContext';
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
    avgRating?: number;
    reviewCount?: number;
  };
  showBadge?: boolean;
  priority?: boolean;
}

export default function ProductCard({ product, showBadge = false, priority = false }: ProductCardProps) {
  const currentImg = 0;
  const [isHovered, setIsHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();

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

  const price = Number(product.price);
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discount = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  const rating = product.avgRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-none overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(67,74,49,0.12)] transition-all duration-700 border border-brand-100 flex flex-col h-full relative w-full hover:-translate-y-1"
    >
      <Link href={`/shop/${product.slug}`} className="block relative aspect-square bg-brand-50/30 overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={isHovered && images.length > 1 ? images[1] : images[currentImg]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center p-6"
          >
            <Image
              src={isHovered && images.length > 1 ? images[1] : images[currentImg]}
              alt={product.name}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-1000 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
            />
          </motion.div>
        </AnimatePresence>

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {showBadge && (
            <span className="bg-brand-500 text-brand-50 text-[9px] font-bold px-3 py-1.5 flex items-center gap-2 rounded-none shadow-sm uppercase tracking-widest border border-brand-400/20">
              <Sparkles size={10} className="text-brand-200" /> Essential
            </span>
          )}
          {discount && (
            <span className="bg-stone-800 text-white text-[9px] font-bold px-3 py-1.5 rounded-none shadow-sm uppercase tracking-widest">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-none flex items-center justify-center shadow-sm transition-all duration-500 ${wishlisted ? 'bg-white' : 'bg-white/80 hover:bg-white border border-brand-100'}`}
          aria-label="Add to wishlist"
        >
          <Heart
            size={16}
            className={`transition-all duration-500 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-stone-400'}`}
          />
        </button>
      </Link>

      <div className="p-5 flex-1 flex flex-col">
        {/* Category row */}
        <div className="mb-3">
          <p className="text-[9px] text-brand-500 font-bold uppercase tracking-[0.15em]">
            {product.category}
          </p>
        </div>

        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-heading text-lg text-stone-900 mb-4 group-hover:text-brand-500 transition-colors line-clamp-2 leading-snug min-h-[3rem] uppercase tracking-wide">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto pt-4 border-t border-brand-50">
          <div className="flex items-end justify-between">
            {/* Price block */}
            <div className="flex flex-col gap-0.5">
              {compareAtPrice && compareAtPrice > price && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-300 line-through font-medium">
                    {formatPrice(compareAtPrice)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="font-sans font-bold text-stone-900 text-lg">
                  {formatPrice(price)}
                </span>
              </div>
            </div>

            <span className="text-brand-500 font-bold text-[9px] uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1.5 border-b border-brand-200 pb-0.5">
              Explore <ChevronRight size={10} />
            </span>
          </div>
        </div>
      </div>
    </motion.div>

  );
}
