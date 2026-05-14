'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCurrency } from '@/context/CurrencyContext';
import { Package, ChevronRight, Sparkles } from 'lucide-react';

interface SmartRecommendationsProps {
  currentProductId: string;
  category: string;
  productName: string;
  relatedProducts?: any[];
}

export default function SmartRecommendations({ currentProductId, category, productName, relatedProducts = [] }: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/products?limit=20`)
      .then(r => r.json())
      .then(data => {
        const allProducts = Array.isArray(data) ? data : (data.products || []);
        
        // Smart filtering logic
        let filtered = allProducts.filter((p: any) => p.id !== currentProductId);
        
        // 1. Try to find products in same category
        let categoryMatches = filtered.filter((p: any) => p.category === category);
        
        // 2. Try to find products that are "Gift Sets" or "Bundles" if current is a single item
        let giftSets = filtered.filter((p: any) => 
          p.name.toLowerCase().includes('set') || 
          p.name.toLowerCase().includes('bundle') ||
          p.name.toLowerCase().includes('gift')
        );

        // Mix them up, prioritizing explicitly connected relatedProducts
        let combined = [...relatedProducts, ...categoryMatches, ...giftSets];
        
        // Remove duplicates and limit to 4
        const unique = Array.from(new Set(combined.map(p => p.id)))
          .map(id => combined.find(p => p.id === id))
          .filter(p => p && p.id !== currentProductId)
          .slice(0, 4);
          
        // If we still need more, add random ones
        if (unique.length < 4) {
          const others = filtered.filter((p: any) => !unique.find(u => u?.id === p.id));
          unique.push(...others.slice(0, 4 - unique.length));
        }

        setRecommendations(unique.slice(0, 4));
      })
      .catch(() => {});
  }, [currentProductId, category, productName, relatedProducts]);

  if (recommendations.length === 0) return null;

  return (
    <div className="mt-20 border-t border-brand-50 pt-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-1 flex items-center gap-2">
              <Sparkles size={12} className="text-brand-500" /> AI Recommended Gifts
            </p>
            <h2 className="text-3xl md:text-4xl font-heading italic text-stone-800">Complete Your Collection</h2>
          </div>
          <Link href="/shop" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-500 hover:text-brand-900 transition-colors">
            Explore All <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {recommendations.map((p: any) => (
            <Link key={p.id} href={`/shop/${p.slug}`} className="group block bg-white rounded-2xl border border-brand-100 overflow-hidden hover:shadow-xl hover:border-brand-200 transition-all duration-300">
              <div className="relative aspect-square bg-brand-50/50 overflow-hidden">
                {p.images?.[0] ? (
                  <Image src={p.images[0]} alt={p.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain p-4 group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={32} className="text-brand-200" />
                  </div>
                )}
                {p.name.toLowerCase().includes('gift') && (
                  <div className="absolute top-3 left-3 bg-brand-500 text-white text-[8px] font-bold px-2 py-1 uppercase tracking-widest z-10">Best for Gifting</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-heading italic text-sm text-brand-900 mb-2 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">{p.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-brand-900 text-sm">{formatPrice(p.price, p.currencyPrices)}</span>
                  {p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price) && (
                    <span className="text-xs text-stone-300 line-through">{formatPrice(p.compareAtPrice, p.currencyPrices)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
