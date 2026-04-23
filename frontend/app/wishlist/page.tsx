'use client';

import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function WishlistPage() {
  return (
    <div className="bg-[#faf8f4] min-h-screen flex flex-col">
      <Navbar alwaysSolid />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-brand-50 p-8 rounded-full mb-6 border border-brand-100"
        >
          <Heart size={64} className="text-brand-500" />
        </motion.div>

        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h1>
        <p className="text-gray-500 max-w-md mb-8">
          Add your favorite personalized tiffins and gifts to your wishlist to keep track of them for later.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/shop"
            className="bg-brand-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingBag size={20} /> Browse Shop
          </Link>
          <Link
            href="/"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
