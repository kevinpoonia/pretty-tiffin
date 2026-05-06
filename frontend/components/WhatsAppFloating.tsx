'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { usePathname } from 'next/navigation';

export default function WhatsAppFloating() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <motion.a
      href="https://wa.me/27640129242?text=Hi, I have a query about Pretty Luxe Atelier."
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[9999] w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-green-600 transition-colors"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle size={32} />
      <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full animate-ping" />
      <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
    </motion.a>
  );
}
