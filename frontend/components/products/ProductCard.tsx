'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Truck, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    category: string;
    price: number;
    images: string[];
  };
  showBadge?: boolean;
  priority?: boolean;
}

export default function ProductCard({ product, showBadge = false, priority = false }: ProductCardProps) {
  const [currentImg, setCurrentImg] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = product.images.length > 0 ? product.images : ['/images/product-1.png'];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImg((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImg((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-100 flex flex-col h-full relative w-full max-w-[180px] md:max-w-none mx-auto"
    >
      <Link href={`/shop/${product.slug}`} className="block relative aspect-[4/5] bg-brand-50 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentImg]}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
            />
          </motion.div>
        </AnimatePresence>

        {showBadge && (
          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 flex items-center gap-1 rounded-sm shadow-sm">
            <Truck size={10} /> Same Day
          </div>
        )}

        {/* Gallery Controls */}
        {images.length > 1 && isHovered && (
          <div className="absolute inset-0 flex items-center justify-between px-2 z-20">
            <button
              onClick={prevImage}
              className="bg-white/80 hover:bg-white p-1 rounded-full shadow-md text-brand-900 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextImage}
              className="bg-white/80 hover:bg-white p-1 rounded-full shadow-md text-brand-900 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 w-full flex justify-center gap-1.5 z-20">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  currentImg === idx ? 'w-4 bg-red-500' : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        <div className="absolute inset-0 bg-brand-900/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      <div className="p-5 flex-1 flex flex-col">
        <p className="text-[10px] text-brand-500 font-bold mb-1 uppercase tracking-widest">
          {product.category}
        </p>
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-heading font-bold text-base text-gray-800 mb-2 group-hover:text-red-500 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} size={12} className="fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-[10px] text-gray-400 ml-1 font-medium">(42 Reviews)</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          <span className="font-bold text-gray-900 text-lg">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <Link
            href={`/shop/${product.slug}`}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-500 transition-colors uppercase tracking-wider"
          >
            Customize
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
