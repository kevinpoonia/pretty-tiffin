'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Filter, X, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';

const curatedCollections = [
  { value: 'same-day-delivery', label: 'Same Day Delivery' },
  { value: 'best-sellers', label: 'Best Sellers' },
  { value: 'personalized', label: 'Personalized' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'occasions', label: 'Occasions' },
];

const relationshipCollections = [
  { value: 'for-husband', label: 'For Husband' },
  { value: 'for-wife', label: 'For Wife' },
  { value: 'for-kids', label: 'For Kids' },
  { value: 'for-parents', label: 'For Parents' },
];

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

const normalizeValue = (value: string) =>
  value.toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const titleCaseFromSlug = (value: string) =>
  value.split('-').filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

const getProductPrice = (p: any) => Number(p.price || 0);

const getProductCreatedAt = (p: any) => {
  if (!p?.createdAt) return 0;
  const d = new Date(p.createdAt);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

const matchesTokens = (product: any, tokens: string[]) => {
  const text = `${product.name || ''} ${product.category || ''} ${product.description || ''}`.toLowerCase();
  return tokens.some(t => text.includes(t));
};

const matchesCuratedCollection = (product: any, collection: string) => {
  switch (normalizeValue(collection)) {
    case 'same-day-delivery': return Boolean(product.isFeatured) || getProductPrice(product) <= 1500;
    case 'best-sellers': return Boolean(product.isFeatured);
    case 'personalized': return Array.isArray(product.customizationOptions) && product.customizationOptions.length > 0;
    case 'birthday': return matchesTokens(product, ['kids', 'birthday', 'gift', 'special']);
    case 'anniversary': return matchesTokens(product, ['vintage', 'copper', 'premium', 'special']);
    case 'corporate': return matchesTokens(product, ['executive', 'corporate', 'modern', 'minimalist']);
    case 'occasions': return matchesTokens(product, ['gift', 'special', 'occasion', 'vintage', 'executive']);
    default: return false;
  }
};

const matchesRelationship = (product: any, relationship: string) => {
  switch (normalizeValue(relationship)) {
    case 'for-husband': return matchesTokens(product, ['executive', 'vintage', 'copper', 'modern']);
    case 'for-wife': return matchesTokens(product, ['vintage', 'special', 'pastel', 'gift']);
    case 'for-kids': return matchesTokens(product, ['kids']);
    case 'for-parents': return matchesTokens(product, ['vintage', 'steel', 'modern']);
    default: return true;
  }
};

const matchesSearch = (product: any, query: string) => {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const text = `${product.name || ''} ${product.category || ''} ${product.description || ''}`.toLowerCase();
  return text.includes(q);
};

const getActiveHeading = (categoryValue: string, relationshipValue: string, searchValue: string, knownCategories: string[]) => {
  if (searchValue) return `Search: "${searchValue}"`;
  if (relationshipValue) {
    const m = relationshipCollections.find(i => i.value === normalizeValue(relationshipValue));
    return m?.label || titleCaseFromSlug(normalizeValue(relationshipValue));
  }
  if (categoryValue) {
    const n = normalizeValue(categoryValue);
    const mc = curatedCollections.find(i => i.value === n);
    if (mc) return mc.label;
    const mk = knownCategories.find(c => normalizeValue(c) === n);
    return mk || titleCaseFromSlug(n);
  }
  return 'Shop the Collection';
};

export default function ShopClient({ initialProducts }: { initialProducts: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [products, setProducts] = useState<any[]>(initialProducts);

  // Refresh products on client mount so freshly-added products always appear
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/products`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProducts(data); })
      .catch(() => {});
  }, []);

  const productCategories = Array.from(
    new Set(products.map((p: any) => p.category).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const activeCategory = searchParams.get('category') || '';
  const activeRelationship = searchParams.get('for') || '';
  const activeSort = searchParams.get('sort') || 'recommended';
  const activeMinPrice = searchParams.get('minPrice') || '';
  const activeMaxPrice = searchParams.get('maxPrice') || '';
  const activeSearch = searchParams.get('search') || '';

  useEffect(() => {
    setMinPriceInput(activeMinPrice);
    setMaxPriceInput(activeMaxPrice);
  }, [activeMinPrice, activeMaxPrice]);

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value.trim()) { params.set(key, value); } else { params.delete(key); }
    });
    const query = params.toString();
    router.push(query ? `/shop?${query}` : '/shop');
  };

  const clearAllFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    router.push('/shop');
  };

  const applyPriceFilters = () => {
    updateSearchParams({ minPrice: minPriceInput || null, maxPrice: maxPriceInput || null });
  };

  const normalizedCategory = normalizeValue(activeCategory);
  const normalizedRelationship = normalizeValue(activeRelationship);

  let visibleProducts = [...products];

  if (activeSearch) visibleProducts = visibleProducts.filter(p => matchesSearch(p, activeSearch));
  if (normalizedCategory) {
    visibleProducts = visibleProducts.filter(p => {
      const cat = normalizeValue(p.category || '');
      return cat === normalizedCategory || matchesCuratedCollection(p, normalizedCategory);
    });
  }
  if (normalizedRelationship) visibleProducts = visibleProducts.filter(p => matchesRelationship(p, normalizedRelationship));
  if (activeMinPrice) {
    const min = Number(activeMinPrice);
    if (!isNaN(min)) visibleProducts = visibleProducts.filter(p => getProductPrice(p) >= min);
  }
  if (activeMaxPrice) {
    const max = Number(activeMaxPrice);
    if (!isNaN(max)) visibleProducts = visibleProducts.filter(p => getProductPrice(p) <= max);
  }

  visibleProducts.sort((a, b) => {
    switch (activeSort) {
      case 'price-asc': return getProductPrice(a) - getProductPrice(b);
      case 'price-desc': return getProductPrice(b) - getProductPrice(a);
      case 'newest': return getProductCreatedAt(b) - getProductCreatedAt(a);
      case 'name-asc': return String(a.name || '').localeCompare(String(b.name || ''));
      default: return (a.isFeatured ? -1 : 1) - (b.isFeatured ? -1 : 1);
    }
  });

  const activeHeading = getActiveHeading(activeCategory, activeRelationship, activeSearch, productCategories);
  const hasActiveFilters = !!(activeCategory || activeRelationship || activeMinPrice || activeMaxPrice || activeSearch);

  const FilterPanel = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center pb-4 border-b border-brand-50">
        <h3 className="font-heading italic text-2xl text-stone-800 flex items-center gap-3">
          <SlidersHorizontal size={20} className="text-brand-400" /> Refine
        </h3>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="text-xs text-brand-500 hover:text-brand-700 font-bold uppercase tracking-widest border-b border-brand-200">
            Reset
          </button>
        )}
      </div>

      {/* Collections */}
      <div>
        <h4 className="font-bold text-stone-800 mb-4 text-xs uppercase tracking-[0.2em]">Collections</h4>
        <div className="space-y-3">
          {curatedCollections.map(col => {
            const isSelected = normalizedCategory === col.value;
            return (
              <label key={col.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => updateSearchParams({ category: isSelected ? null : col.value, for: null })}
                  className="w-4 h-4 rounded-full border-brand-200 text-brand-900 focus:ring-brand-500 cursor-pointer transition-all"
                />
                <span className={`text-sm tracking-wide transition-colors ${isSelected ? 'text-brand-900 font-bold' : 'text-stone-500 group-hover:text-stone-800'}`}>
                  {col.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Product Categories */}
      {productCategories.length > 0 && (
        <div className="pt-4 border-t border-brand-100">
          <h4 className="font-semibold text-brand-900 mb-3 text-sm">Product Categories</h4>
          <div className="space-y-2">
            {productCategories.map(cat => {
              const isSelected = normalizeValue(cat) === normalizedCategory;
              return (
                <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => updateSearchParams({ category: isSelected ? null : cat, for: null })}
                    className="rounded border-brand-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                  />
                  <span className={`text-sm transition-colors ${isSelected ? 'text-brand-700 font-semibold' : 'text-brand-600 group-hover:text-brand-900'}`}>
                    {cat}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Relationship */}
      <div className="pt-4 border-t border-brand-100">
        <h4 className="font-semibold text-brand-900 mb-3 text-sm">Gift by Relationship</h4>
        <div className="space-y-2">
          {relationshipCollections.map(rel => {
            const isSelected = normalizedRelationship === rel.value;
            return (
              <label key={rel.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => updateSearchParams({ for: isSelected ? null : rel.value, category: null })}
                  className="rounded border-brand-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                />
                <span className={`text-sm transition-colors ${isSelected ? 'text-brand-700 font-semibold' : 'text-brand-600 group-hover:text-brand-900'}`}>
                  {rel.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div className="pt-4 border-t border-brand-100">
        <h4 className="font-semibold text-brand-900 mb-3 text-sm">Price Range (₹)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPriceInput}
            onChange={e => setMinPriceInput(e.target.value)}
            className="w-full bg-brand-50 text-sm p-2 rounded-lg border border-brand-200 focus:border-brand-500 focus:outline-none"
          />
          <span className="text-brand-400 shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPriceInput}
            onChange={e => setMaxPriceInput(e.target.value)}
            className="w-full bg-brand-50 text-sm p-2 rounded-lg border border-brand-200 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <button
          onClick={applyPriceFilters}
          className="mt-3 w-full bg-brand-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors"
        >
          Apply Price Range
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Navbar alwaysSolid />
      <main className="flex-1 bg-[#fdfaf6] min-h-screen pb-20 selection:bg-brand-200">
        {/* Page Header */}
        <div className="bg-white py-16 md:py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-heading italic text-stone-800 mb-6">{activeHeading}</h1>
            <p className="text-stone-500 text-base md:text-lg italic max-w-lg mx-auto font-medium">
              {activeSearch
                ? `Discovering artisanal treasures for "${activeSearch}"`
                : 'Hand-guided laser engravings on premium stainless steel, crafted for a lifetime of memories.'}
            </p>
          </div>
          
          {/* Wavy Separator */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] translate-y-[99%] z-10 text-brand-50">
            <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 48H1440V0C1350 0 1260 24 1170 24C1080 24 990 0 900 0C810 0 720 24 630 24C540 24 450 0 360 0C270 0 180 24 90 24C45 24 0 12 0 12V48Z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-8">

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-72 lg:w-80 flex-shrink-0">
              <div className="bg-white p-8 rounded-[2.5rem] organic-shape-1 shadow-xl border border-brand-50 lg:sticky lg:top-32">
                <FilterPanel />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Sort Bar */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="md:hidden flex items-center gap-2 bg-white border border-brand-200 text-brand-700 font-semibold text-sm px-4 py-2 rounded-full hover:border-brand-500 transition-colors"
                  >
                    <Filter size={15} /> Filters
                    {hasActiveFilters && (
                      <span className="bg-brand-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        !
                      </span>
                    )}
                  </button>
                  <p className="text-sm text-brand-600">{visibleProducts.length} products</p>
                </div>

                <div className="flex items-center gap-3 bg-white border border-brand-100 rounded-full px-6 py-2 shadow-sm">
                  <span className="text-stone-400 text-xs font-bold uppercase tracking-widest shrink-0">Sort By</span>
                  <select
                    value={activeSort}
                    onChange={e => updateSearchParams({ sort: e.target.value })}
                    className="bg-transparent text-stone-800 text-sm font-bold focus:outline-none cursor-pointer pr-4 italic"
                  >
                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Active filter chips */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {activeSearch && (
                    <span className="flex items-center gap-1.5 bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                      Search: "{activeSearch}"
                      <button onClick={() => updateSearchParams({ search: null })}><X size={12} /></button>
                    </span>
                  )}
                  {activeCategory && (
                    <span className="flex items-center gap-1.5 bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {titleCaseFromSlug(activeCategory)}
                      <button onClick={() => updateSearchParams({ category: null })}><X size={12} /></button>
                    </span>
                  )}
                  {activeRelationship && (
                    <span className="flex items-center gap-1.5 bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {titleCaseFromSlug(activeRelationship)}
                      <button onClick={() => updateSearchParams({ for: null })}><X size={12} /></button>
                    </span>
                  )}
                  {(activeMinPrice || activeMaxPrice) && (
                    <span className="flex items-center gap-1.5 bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                      ₹{activeMinPrice || '0'} – ₹{activeMaxPrice || '∞'}
                      <button onClick={() => updateSearchParams({ minPrice: null, maxPrice: null })}><X size={12} /></button>
                    </span>
                  )}
                </div>
              )}

              {visibleProducts.length === 0 ? (
                <div className="bg-white border border-brand-100 rounded-3xl p-12 text-center">
                  <h2 className="text-xl font-bold font-heading text-brand-900 mb-2">No products found</h2>
                  <p className="text-brand-500 mb-6 text-sm">Try different filters or search terms.</p>
                  <button
                    onClick={clearAllFilters}
                    className="bg-brand-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-600 transition-colors text-sm"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                  {visibleProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 bg-black/50 z-[60] md:hidden" onClick={() => setMobileFiltersOpen(false)}>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              className="absolute right-0 top-0 h-full w-[86vw] max-w-sm bg-white shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-500 p-1">
                  <X size={22} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <FilterPanel />
              </div>
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full bg-brand-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-800 transition-colors"
                >
                  Show {visibleProducts.length} Products
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
