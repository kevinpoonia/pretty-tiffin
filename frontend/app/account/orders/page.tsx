'use client';

import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[60vh]">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-red-500">Home</Link>
        <ChevronRight size={14} />
        <Link href="/account" className="hover:text-red-500">Account</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">Orders</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8 font-heading">My Orders</h1>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center"
      >
        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
          When you place an order, it will appear here. Start shopping our premium tiffin collection!
        </p>
        <Link 
          href="/shop" 
          className="inline-block bg-red-500 text-white px-10 py-3 rounded-full font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
        >
          Explore Shop
        </Link>
      </motion.div>
    </div>
  );
}
