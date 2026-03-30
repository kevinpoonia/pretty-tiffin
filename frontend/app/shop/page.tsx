'use client';

import { motion } from 'framer-motion';
import { Filter, ChevronDown, Star, Search } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function ShopPage() {
  return (
    <>
      <Navbar alwaysSolid />
      <main className="flex-1 bg-brand-50 min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          
          {/* Header */}
          <div className="text-center py-12 mb-8 border-b border-brand-200">
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-brand-900 mb-4">Shop the Collection</h1>
            <p className="text-brand-600 max-w-2xl mx-auto">Explore our range of premium, customizable stainless steel tiffins.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-100 sticky top-28">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-heading font-semibold text-lg text-brand-900 flex items-center gap-2">
                    <Filter size={18} /> Filters
                  </h3>
                  <button className="text-xs text-brand-500 hover:text-brand-700">Clear All</button>
                </div>

                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <h4 className="font-medium text-brand-900 mb-3 flex justify-between items-center">
                      Category <ChevronDown size={16} className="text-brand-500" />
                    </h4>
                    <div className="space-y-2">
                      {['Executive', 'Kids', 'Jumbo Family', 'Corporate'].map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded border-brand-300 text-brand-500 focus:ring-brand-500" />
                          <span className="text-sm text-brand-700">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="pt-4 border-t border-brand-100">
                    <h4 className="font-medium text-brand-900 mb-3 flex justify-between items-center">
                      Price <ChevronDown size={16} className="text-brand-500" />
                    </h4>
                     <div className="flex items-center justify-between gap-4">
                        <input type="number" placeholder="Min" className="w-full bg-brand-50 text-sm p-2 rounded border border-brand-200 focus:border-brand-500 focus:outline-none" />
                        <span className="text-brand-500">-</span>
                        <input type="number" placeholder="Max" className="w-full bg-brand-50 text-sm p-2 rounded border border-brand-200 focus:border-brand-500 focus:outline-none" />
                     </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-brand-600">Showing 1-12 of 36 products</p>
                <div className="flex items-center gap-2 text-sm bg-white border border-brand-200 rounded-full px-4 py-2">
                  <span className="text-brand-600">Sort by:</span>
                  <select className="bg-transparent text-brand-900 font-medium focus:outline-none cursor-pointer">
                    <option>Recommended</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest Arrivals</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item, idx) => (
                  <motion.div 
                    key={item}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-100 flex flex-col h-full"
                  >
                    <Link href={`/shop/product-slug-${item}`} className="block relative aspect-[4/5] bg-brand-100 overflow-hidden">
                      {/* Image Layer */}
                      <div className="absolute inset-0 flex items-center justify-center text-brand-400">
                        Image {item}
                      </div>

                      {/* Quick Add Overlay */}
                      <div className="absolute inset-0 bg-brand-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>

                    <div className="p-5 flex-1 flex flex-col">
                      <p className="text-xs text-brand-500 font-semibold mb-1 uppercase tracking-wider">Tiffin Series</p>
                      <Link href={`/shop/product-slug-${item}`}>
                        <h3 className="font-heading font-semibold text-lg text-brand-900 mb-2 group-hover:text-brand-600 transition-colors">Tiffin Product Name {item}</h3>
                      </Link>
                      
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={14} className="fill-brand-500 text-brand-500" />
                        ))}
                        <span className="text-xs text-brand-600 ml-1">(42)</span>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <span className="font-bold text-brand-900">₹1,299</span>
                        <button className="text-brand-500 font-medium hover:text-brand-700 text-sm">Add Options</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-12">
                <button className="px-6 py-3 border border-brand-300 text-brand-700 bg-white hover:bg-brand-50 font-medium rounded-full transition-colors">
                  Load More Products
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
