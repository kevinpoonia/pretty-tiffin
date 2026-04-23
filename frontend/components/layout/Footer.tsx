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
            <Link href="/" className="inline-block">
              <span className="font-heading font-bold text-2xl text-white tracking-tight">
                Pretty<span className="text-brand-400">Tiffin</span>
              </span>
            </Link>
            <p className="text-sm text-brand-200 leading-relaxed max-w-xs">
              Premium, engraved stainless steel tiffins designed for modern Indian lifestyles. Combining heritage with personalization.
            </p>
            <div className="flex items-center gap-3 pt-1">
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
                  className="w-9 h-9 bg-brand-800 hover:bg-brand-500 rounded-lg flex items-center justify-center transition-colors text-sm"
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
              <div className="flex items-center gap-2 text-brand-300 text-sm font-medium bg-brand-800 rounded-xl px-4 py-3 border border-brand-700">
                <Send size={14} className="text-brand-400" />
                Thanks for subscribing!
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-brand-800 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-brand-400 border border-brand-700"
                />
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-400 text-white px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Subscribe <Send size={14} />
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
