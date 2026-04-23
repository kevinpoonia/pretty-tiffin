'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Send } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="bg-brand-900 text-brand-100 pt-12 md:pt-16 pb-8 border-t border-brand-800 overflow-hidden w-full">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 md:gap-12 mb-12">

          {/* Brand */}
          <div className="space-y-4 sm:col-span-2 xl:col-span-1">
            <Link href="/" className="inline-block group">
              <span className="font-heading italic text-3xl text-white group-hover:text-brand-300 transition-colors">
                Pretty<span className="text-brand-400">Tiffin</span>
              </span>
            </Link>
            <p className="text-base text-brand-200 italic leading-relaxed max-w-xs">
              Hand-guided laser engravings on premium stainless steel. A legacy of love, crafted for your most cherished moments.
            </p>
            <div className="flex items-center gap-4 pt-4">
              {[
                { label: 'Instagram', href: 'https://instagram.com', icon: '📸' },
                { label: 'Facebook', href: 'https://facebook.com', icon: '👍' },
                { label: 'WhatsApp', href: 'https://wa.me/919999988888', icon: '💬' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-11 h-11 organic-shape-2 bg-brand-800 hover:bg-brand-400 flex items-center justify-center transition-all duration-500 text-lg hover:scale-110 shadow-lg"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-3 text-sm text-brand-200">
              <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=personalized" className="hover:text-white transition-colors">Customize Your Tiffin</Link></li>
              <li><Link href="/shop?category=corporate" className="hover:text-white transition-colors">Corporate Gifting</Link></li>
              <li><Link href="/shop?for=For Husband" className="hover:text-white transition-colors">Gifts for Husband</Link></li>
              <li><Link href="/shop?category=best-sellers" className="hover:text-white transition-colors">Best Sellers</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-brand-200">
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Newsletter</h4>
            <p className="text-sm text-brand-200 mb-4">Subscribe for exclusive offers and new product drops.</p>
            {subscribed ? (
              <div className="flex flex-col items-center justify-center py-6 px-4 bg-brand-800 organic-shape-1 border border-brand-700 animate-fade-in">
                <Send size={24} className="text-brand-400 mb-3" />
                <p className="text-white font-heading italic text-lg">Welcome to the family!</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col gap-4">
                <input
                  type="email"
                  required
                  placeholder="Your favorite email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-brand-800/50 text-white px-6 py-3.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder-brand-400 border border-brand-700 transition-all"
                />
                <button
                  type="submit"
                  className="bg-brand-100 text-brand-900 hover:bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-500 flex items-center justify-center gap-3 shadow-xl hover:scale-105 active:scale-95"
                >
                  Join the Circle <Send size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-brand-800 pt-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left text-xs text-brand-300 gap-4">
          <p>© {new Date().getFullYear()} Pretty Tiffin. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
