'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Filter, X, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';

const curatedCollections = [
  { value: 'tiffins', label: 'Tiffin Boxes' },
  { value: 'kitchenware', label: 'Kitchenware' },
  { value: 'apparels', label: 'Apparels' },
  { value: 'corporate', label: 'Corporate Gifts' },
  { value: 'best-sellers', label: 'Best Sellers' },
  { value: 'new-arrivals', label: 'New Arrivals' },
  { value: 'gifting', label: 'Gift Hampers' },
];

const relationshipCollections = [
  { value: 'for-him', label: 'For Him' },
  { value: 'for-her', label: 'For Her' },
  { value: 'for-kids', label: 'For Kids' },
  { value: 'for-home', label: 'For Home' },
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
  const cat = normalizeValue(product.category || '');
  switch (normalizeValue(collection)) {
    case 'tiffins': return cat === 'tiffins' || matchesTokens(product, ['tiffin', 'lunchbox', 'lunch box']);
    case 'kitchenware': return cat === 'kitchenware' || matchesTokens(product, ['kitchen', 'cookware', 'vessel', 'utensil', 'kadai', 'bowl']);
    case 'apparels': return cat === 'apparels' || matchesTokens(product, ['apparel', 'shirt', 'kurta', 'fabric', 'clothing', 'wear']);
    case 'corporate': return cat === 'corporate' || matchesTokens(product, ['executive', 'corporate', 'bulk', 'company']);
    case 'best-sellers': return Boolean(product.isFeatured);
    case 'new-arrivals': return getProductCreatedAt(product) > Date.now() - 30 * 24 * 60 * 60 * 1000;
    case 'gifting': return matchesTokens(product, ['gift', 'hamper', 'festive', 'occasion', 'special']);
    default: return false;
  }
};

const matchesRelationship = (product: any, relationship: string) => {
  switch (normalizeValue(relationship)) {
    case 'for-him': return matchesTokens(product, ['executive', 'copper', 'modern', 'vintage', 'mens']);
    case 'for-her': return matchesTokens(product, ['pastel', 'special', 'rose', 'women', 'ethnic']);
    case 'for-kids': return matchesTokens(product, ['kids', 'children', 'school', 'small']);
    case 'for-home': return matchesTokens(product, ['kitchen', 'vessel', 'home', 'cookware', 'bowl']);
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
    <div className="space-y-10">
      <div className="flex justify-between items-center pb-5 border-b border-brand-100">
        <h3 className="font-heading text-xl text-stone-800 flex items-center gap-3 uppercase tracking-tight">
          <SlidersHorizontal size={18} className="text-brand-500" /> Refine
        </h3>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="text-[10px] text-brand-500 hover:text-brand-700 font-bold uppercase tracking-widest border-b border-brand-200 transition-colors">
            Reset
          </button>
        )}
      </div>

      {/* Collections */}
      <div>
        <h4 className="font-bold text-stone-400 mb-5 text-[10px] uppercase tracking-[0.2em]">Collections</h4>
        <div className="space-y-4">
          {curatedCollections.map(col => {
            const isSelected = normalizedCategory === col.value;
            return (
              <label key={col.value} className="flex items-center gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => updateSearchParams({ category: isSelected ? null : col.value, for: null })}
                  className="w-4 h-4 rounded-none border-brand-200 text-brand-500 focus:ring-brand-500 cursor-pointer transition-all"
                />
                <span className={`text-[11px] uppercase tracking-widest transition-colors ${isSelected ? 'text-brand-500 font-bold' : 'text-stone-500 group-hover:text-stone-900'}`}>
                  {col.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Product Categories */}
      {productCategories.length > 0 && (
        <div className="pt-6 border-t border-brand-50">
          <h4 className="font-bold text-stone-400 mb-5 text-[10px] uppercase tracking-[0.2em]">Categories</h4>
          <div className="space-y-4">
            {productCategories.map(cat => {
              const isSelected = normalizeValue(cat) === normalizedCategory;
              return (
                <label key={cat} className="flex items-center gap-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => updateSearchParams({ category: isSelected ? null : cat, for: null })}
                    className="w-4 h-4 rounded-none border-brand-200 text-brand-500 focus:ring-brand-500 cursor-pointer transition-all"
                  />
                  <span className={`text-[11px] uppercase tracking-widest transition-colors ${isSelected ? 'text-brand-500 font-bold' : 'text-stone-500 group-hover:text-stone-900'}`}>
                    {cat}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Relationship */}
      <div className="pt-6 border-t border-brand-50">
        <h4 className="font-bold text-stone-400 mb-5 text-[10px] uppercase tracking-[0.2em]">Gift For</h4>
        <div className="space-y-4">
          {relationshipCollections.map(rel => {
            const isSelected = normalizedRelationship === rel.value;
            return (
              <label key={rel.value} className="flex items-center gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => updateSearchParams({ for: isSelected ? null : rel.value, category: null })}
                  className="w-4 h-4 rounded-none border-brand-200 text-brand-500 focus:ring-brand-500 cursor-pointer transition-all"
                />
                <span className={`text-[11px] uppercase tracking-widest transition-colors ${isSelected ? 'text-brand-500 font-bold' : 'text-stone-500 group-hover:text-stone-900'}`}>
                  {rel.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div className="pt-6 border-t border-brand-50">
        <h4 className="font-bold text-stone-400 mb-5 text-[10px] uppercase tracking-[0.2em]">Price (₹)</h4>
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder="Min"
            value={minPriceInput}
            onChange={e => setMinPriceInput(e.target.value)}
            className="w-full bg-brand-50 text-xs p-3 rounded-none border border-brand-100 focus:border-brand-500 focus:outline-none placeholder-stone-300"
          />
          <span className="text-brand-200 shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPriceInput}
            onChange={e => setMaxPriceInput(e.target.value)}
            className="w-full bg-brand-50 text-xs p-3 rounded-none border border-brand-100 focus:border-brand-500 focus:outline-none placeholder-stone-300"
          />
        </div>
        <button
          onClick={applyPriceFilters}
          className="mt-6 w-full bg-brand-500 text-white px-4 py-4 rounded-none text-[10px] font-bold hover:bg-brand-600 transition-all uppercase tracking-[0.2em]"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Navbar alwaysSolid />
      <main className="flex-1 bg-brand-50 min-h-screen pb-20 selection:bg-brand-200 font-sans">
        {/* Page Header */}
        <div className="bg-white pt-28 md:pt-36 lg:pt-44 pb-10 md:pb-16 relative overflow-hidden border-b border-brand-100">
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-heading text-stone-800 mb-4 uppercase tracking-tight">{activeHeading}</h1>
            <p className="text-stone-500 max-w-lg mx-auto font-medium uppercase tracking-widest text-[10px]">
              {activeSearch
                ? `Discovering artisanal treasures for "${activeSearch}"`
                : 'Hand-guided laser engravings on premium stainless steel, crafted for a lifetime of memories.'}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 mt-12">
          <div className="flex flex-col md:flex-row gap-12">

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-72 lg:w-80 flex-shrink-0">
              <div className="bg-white p-6 lg:p-8 rounded-none shadow-sm border border-brand-100 lg:sticky lg:top-44">
                <FilterPanel />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Sort Bar */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8">
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="md:hidden flex items-center gap-2 bg-white border border-brand-100 text-stone-700 font-bold text-[10px] px-6 py-3 rounded-none hover:border-brand-500 transition-colors uppercase tracking-widest"
                  >
                    <Filter size={14} /> Filters
                    {hasActiveFilters && (
                      <span className="bg-brand-500 text-white text-[9px] w-4 h-4 rounded-none flex items-center justify-center font-bold">
                        !
                      </span>
                    )}
                  </button>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-500">{visibleProducts.length} products found</p>
                </div>

                <div className="flex items-center gap-3 bg-white border border-brand-100 rounded-none px-6 py-2.5 shadow-sm">
                  <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest shrink-0">Sort By</span>
                  <select
                    value={activeSort}
                    onChange={e => updateSearchParams({ sort: e.target.value })}
                    className="bg-transparent text-stone-800 text-xs font-bold focus:outline-none cursor-pointer pr-4 uppercase tracking-widest border-none"
                  >
                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Active filter chips */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {activeSearch && (
                    <span className="flex items-center gap-2 bg-brand-500 text-white text-[9px] font-bold px-4 py-2 rounded-none uppercase tracking-widest">
                      Search: "{activeSearch}"
                      <button onClick={() => updateSearchParams({ search: null })}><X size={12} /></button>
                    </span>
                  )}
                  {activeCategory && (
                    <span className="flex items-center gap-2 bg-brand-500 text-white text-[9px] font-bold px-4 py-2 rounded-none uppercase tracking-widest">
                      {titleCaseFromSlug(activeCategory)}
                      <button onClick={() => updateSearchParams({ category: null })}><X size={12} /></button>
                    </span>
                  )}
                  {activeRelationship && (
                    <span className="flex items-center gap-2 bg-brand-500 text-white text-[9px] font-bold px-4 py-2 rounded-none uppercase tracking-widest">
                      {titleCaseFromSlug(activeRelationship)}
                      <button onClick={() => updateSearchParams({ for: null })}><X size={12} /></button>
                    </span>
                  )}
                  {(activeMinPrice || activeMaxPrice) && (
                    <span className="flex items-center gap-2 bg-brand-500 text-white text-[9px] font-bold px-4 py-2 rounded-none uppercase tracking-widest">
                      ₹{activeMinPrice || '0'} – ₹{activeMaxPrice || '∞'}
                      <button onClick={() => updateSearchParams({ minPrice: null, maxPrice: null })}><X size={12} /></button>
                    </span>
                  )}
                </div>
              )}

              {visibleProducts.length === 0 ? (
                <div className="bg-white border border-brand-100 rounded-none p-16 text-center shadow-sm">
                  <h2 className="text-xl font-bold font-heading text-stone-900 mb-2 uppercase tracking-tight">No products found</h2>
                  <p className="text-stone-500 mb-8 text-sm uppercase tracking-widest text-[10px]">Try different filters or search terms.</p>
                  <button
                    onClick={clearAllFilters}
                    className="bg-brand-500 text-white px-10 py-4 rounded-none font-bold hover:bg-brand-600 transition-colors text-[10px] uppercase tracking-[0.2em]"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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
              <div className="flex items-center justify-between px-6 py-5 border-b border-brand-50">
                <h2 className="font-bold text-stone-900 text-sm uppercase tracking-widest">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-stone-500 p-1">
                  <X size={22} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <FilterPanel />
              </div>
              <div className="p-6 border-t border-brand-50">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full bg-brand-500 text-white py-4 rounded-none font-bold text-[10px] hover:bg-brand-600 transition-colors uppercase tracking-[0.2em]"
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
