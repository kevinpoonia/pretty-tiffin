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
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-100 flex flex-col h-full relative w-full"
    >
      <Link href={`/shop/${product.slug}`} className="block relative aspect-[4/5] bg-brand-50 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentImg]}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
            />
          </motion.div>
        </AnimatePresence>

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {showBadge && (
            <span className="bg-brand-500 text-white text-[9px] font-bold px-2 py-1 flex items-center gap-1 rounded shadow-sm">
              <Truck size={9} /> Same Day
            </span>
          )}
          {discount && (
            <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-1 rounded shadow-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-all"
          aria-label="Add to wishlist"
        >
          <Heart
            size={15}
            className={`transition-colors ${wishlisted ? 'fill-brand-500 text-brand-500' : 'text-gray-400'}`}
          />
        </button>

        {/* Gallery Controls - always visible on mobile, hover on desktop */}
        {images.length > 1 && (
          <div className={`absolute inset-0 flex items-center justify-between px-1.5 z-20 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-0'} sm:opacity-100`}>
            <button onClick={prevImage} className="bg-white/85 hover:bg-white p-1 rounded-full shadow-md text-brand-900 transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button onClick={nextImage} className="bg-white/85 hover:bg-white p-1 rounded-full shadow-md text-brand-900 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 w-full flex justify-center gap-1 z-20">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all ${currentImg === idx ? 'w-4 bg-brand-500' : 'w-1 bg-gray-300'}`}
              />
            ))}
          </div>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[9px] text-brand-500 font-bold mb-1 uppercase tracking-widest line-clamp-1">
          {product.category}
        </p>
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-heading font-bold text-sm text-gray-800 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map(star => (
            <Star key={star} size={11} className="fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-[9px] text-gray-400 ml-1">(42)</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
          <div>
            <span className="font-bold text-gray-900 text-base">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-gray-400 line-through ml-1.5">
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <Link
            href={`/shop/${product.slug}`}
            className="bg-brand-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-brand-500 transition-colors uppercase tracking-wider"
          >
            Customize
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
