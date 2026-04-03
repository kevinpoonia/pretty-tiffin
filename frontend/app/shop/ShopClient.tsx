'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  { value: 'occasions', label: 'Occasions' }
];

const relationshipCollections = [
  { value: 'for-husband', label: 'For Husband' },
  { value: 'for-wife', label: 'For Wife' },
  { value: 'for-kids', label: 'For Kids' },
  { value: 'for-parents', label: 'For Parents' }
];

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'name-asc', label: 'Name: A to Z' }
];

const normalizeValue = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const titleCaseFromSlug = (value: string) =>
  value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getProductPrice = (product: any) => Number(product.price || 0);

const getProductCreatedAt = (product: any) => {
  if (!product?.createdAt) return 0;
  const date = new Date(product.createdAt);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const matchesTokens = (product: any, tokens: string[]) => {
  const searchableText = `${product.name || ''} ${product.category || ''} ${product.description || ''}`.toLowerCase();
  return tokens.some((token) => searchableText.includes(token));
};

const matchesCuratedCollection = (product: any, collection: string) => {
  switch (normalizeValue(collection)) {
    case 'same-day-delivery':
      return Boolean(product.isFeatured) || getProductPrice(product) <= 1500;
    case 'best-sellers':
      return Boolean(product.isFeatured);
    case 'personalized':
      return Array.isArray(product.customizationOptions) && product.customizationOptions.length > 0;
    case 'birthday':
      return matchesTokens(product, ['kids', 'birthday', 'gift', 'special']);
    case 'anniversary':
      return matchesTokens(product, ['vintage', 'copper', 'premium', 'special']);
    case 'corporate':
      return matchesTokens(product, ['executive', 'corporate', 'modern', 'minimalist']);
    case 'occasions':
      return matchesTokens(product, ['gift', 'special', 'occasion', 'vintage', 'kids', 'executive']);
    default:
      return false;
  }
};

const matchesRelationship = (product: any, relationship: string) => {
  switch (normalizeValue(relationship)) {
    case 'for-husband':
      return matchesTokens(product, ['executive', 'vintage', 'copper', 'modern']);
    case 'for-wife':
      return matchesTokens(product, ['vintage', 'special', 'pastel', 'gift']);
    case 'for-kids':
      return matchesTokens(product, ['kids']);
    case 'for-parents':
      return matchesTokens(product, ['vintage', 'steel', 'modern']);
    default:
      return true;
  }
};

const getActiveHeading = (categoryValue: string, relationshipValue: string, knownCategories: string[]) => {
  if (relationshipValue) {
    const matchedRelationship = relationshipCollections.find((item) => item.value === normalizeValue(relationshipValue));
    return matchedRelationship?.label || titleCaseFromSlug(normalizeValue(relationshipValue));
  }

  if (categoryValue) {
    const normalizedCategory = normalizeValue(categoryValue);
    const matchedCollection = curatedCollections.find((item) => item.value === normalizedCategory);
    if (matchedCollection) return matchedCollection.label;

    const matchedCategory = knownCategories.find((category) => normalizeValue(category) === normalizedCategory);
    return matchedCategory || titleCaseFromSlug(normalizedCategory);
  }

  return 'Shop the Collection';
};

const getActiveDescription = (categoryValue: string, relationshipValue: string) => {
  if (relationshipValue) {
    return 'Browse a curated gifting selection tailored to the relationship you are shopping for.';
  }

  if (categoryValue) {
    return 'This collection is filtered to the category you selected so you can browse a more focused set of products.';
  }

  return 'Explore our range of premium, customizable stainless steel tiffins.';
};

export default function ShopClient({ initialProducts }: { initialProducts: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');

  const productCategories = Array.from(
    new Set(
      initialProducts
        .map((product: any) => product.category)
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right));

  const activeCategory = searchParams.get('category') || '';
  const activeRelationship = searchParams.get('for') || '';
  const activeSort = searchParams.get('sort') || 'recommended';
  const activeMinPrice = searchParams.get('minPrice') || '';
  const activeMaxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    setMinPriceInput(activeMinPrice);
    setMaxPriceInput(activeMaxPrice);
  }, [activeMinPrice, activeMaxPrice]);

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
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
    updateSearchParams({
      minPrice: minPriceInput || null,
      maxPrice: maxPriceInput || null
    });
  };

  const normalizedCategory = normalizeValue(activeCategory);
  const normalizedRelationship = normalizeValue(activeRelationship);

  let visibleProducts = [...initialProducts];

  if (normalizedCategory) {
    visibleProducts = visibleProducts.filter((product) => {
      const productCategory = normalizeValue(product.category || '');

      if (productCategory === normalizedCategory) {
        return true;
      }

      return matchesCuratedCollection(product, normalizedCategory);
    });
  }

  if (normalizedRelationship) {
    visibleProducts = visibleProducts.filter((product) => matchesRelationship(product, normalizedRelationship));
  }

  if (activeMinPrice) {
    const minPrice = Number(activeMinPrice);
    if (!Number.isNaN(minPrice)) {
      visibleProducts = visibleProducts.filter((product) => getProductPrice(product) >= minPrice);
    }
  }

  if (activeMaxPrice) {
    const maxPrice = Number(activeMaxPrice);
    if (!Number.isNaN(maxPrice)) {
      visibleProducts = visibleProducts.filter((product) => getProductPrice(product) <= maxPrice);
    }
  }

  visibleProducts.sort((left, right) => {
    switch (activeSort) {
      case 'price-asc':
        return getProductPrice(left) - getProductPrice(right);
      case 'price-desc':
        return getProductPrice(right) - getProductPrice(left);
      case 'newest':
        return getProductCreatedAt(right) - getProductCreatedAt(left);
      case 'name-asc':
        return String(left.name || '').localeCompare(String(right.name || ''));
      default:
        if (Boolean(left.isFeatured) === Boolean(right.isFeatured)) {
          return 0;
        }
        return left.isFeatured ? -1 : 1;
    }
  });

  const activeHeading = getActiveHeading(activeCategory, activeRelationship, productCategories);
  const activeDescription = getActiveDescription(activeCategory, activeRelationship);

  return (
    <>
      <Navbar alwaysSolid />
      <main className="flex-1 bg-brand-50 min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center py-12 mb-8 border-b border-brand-200">
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-brand-900 mb-4">{activeHeading}</h1>
            <p className="text-brand-600 max-w-2xl mx-auto">{activeDescription}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-72 flex-shrink-0">
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-brand-100 lg:sticky lg:top-28 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-heading font-semibold text-lg text-brand-900 flex items-center gap-2">
                    <Filter size={18} /> Filters
                  </h3>
                  <button onClick={clearAllFilters} className="text-xs text-brand-500 hover:text-brand-700">
                    Clear All
                  </button>
                </div>

                <div>
                  <h4 className="font-medium text-brand-900 mb-3 flex justify-between items-center">
                    Shop by Collection <ChevronDown size={16} className="text-brand-500" />
                  </h4>
                  <div className="space-y-2">
                    {curatedCollections.map((collection) => {
                      const isSelected = normalizedCategory === collection.value;
                      return (
                        <label key={collection.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => updateSearchParams({ category: isSelected ? null : collection.value })}
                            className="rounded border-brand-300 text-brand-500 focus:ring-brand-500"
                          />
                          <span className="text-sm text-brand-700">{collection.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-100">
                  <h4 className="font-medium text-brand-900 mb-3 flex justify-between items-center">
                    Product Categories <ChevronDown size={16} className="text-brand-500" />
                  </h4>
                  <div className="space-y-2">
                    {productCategories.map((category) => {
                      const isSelected = normalizeValue(category) === normalizedCategory;
                      return (
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => updateSearchParams({ category: isSelected ? null : category })}
                            className="rounded border-brand-300 text-brand-500 focus:ring-brand-500"
                          />
                          <span className="text-sm text-brand-700">{category}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-100">
                  <h4 className="font-medium text-brand-900 mb-3 flex justify-between items-center">
                    Gift by Relationship <ChevronDown size={16} className="text-brand-500" />
                  </h4>
                  <div className="space-y-2">
                    {relationshipCollections.map((relationship) => {
                      const isSelected = normalizedRelationship === relationship.value;
                      return (
                        <label key={relationship.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => updateSearchParams({ for: isSelected ? null : relationship.value })}
                            className="rounded border-brand-300 text-brand-500 focus:ring-brand-500"
                          />
                          <span className="text-sm text-brand-700">{relationship.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-100">
                  <h4 className="font-medium text-brand-900 mb-3 flex justify-between items-center">
                    Price <ChevronDown size={16} className="text-brand-500" />
                  </h4>
                  <div className="flex items-center justify-between gap-4">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-full bg-brand-50 text-sm p-2 rounded border border-brand-200 focus:border-brand-500 focus:outline-none"
                    />
                    <span className="text-brand-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-full bg-brand-50 text-sm p-2 rounded border border-brand-200 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={applyPriceFilters}
                    className="mt-3 w-full bg-brand-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors"
                  >
                    Apply Price Range
                  </button>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <p className="text-sm text-brand-600">Showing {visibleProducts.length} products</p>
                <div className="flex items-center gap-2 text-sm bg-white border border-brand-200 rounded-full px-4 py-2">
                  <span className="text-brand-600">Sort by:</span>
                  <select
                    value={activeSort}
                    onChange={(e) => updateSearchParams({ sort: e.target.value })}
                    className="bg-transparent text-brand-900 font-medium focus:outline-none cursor-pointer"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {visibleProducts.length === 0 ? (
                <div className="bg-white border border-brand-100 rounded-3xl p-12 text-center">
                  <h2 className="text-2xl font-bold font-heading text-brand-900 mb-2">No products matched these filters</h2>
                  <p className="text-brand-500 mb-6">Try a different category, price range, or clear the current filters.</p>
                  <button onClick={clearAllFilters} className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors">
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
