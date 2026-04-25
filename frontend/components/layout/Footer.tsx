'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Send, MessageCircle, Globe, Leaf, Sparkles } from 'lucide-react';

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
    <footer className="bg-brand-900 text-brand-100 pt-16 pb-8 border-t border-brand-800 overflow-hidden w-full font-sans">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-10 md:gap-12 mb-16">

          {/* Brand */}
          <div className="space-y-4 sm:col-span-2 xl:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-heading font-bold text-2xl text-white tracking-tight">
                Pretty Luxe<span className="text-brand-400">Atelier</span>
              </span>
            </Link>
            <p className="text-sm text-brand-200 leading-relaxed max-w-xs">
              Premium, laser-engraved stainless steel tiffin boxes crafted for meaningful gifting. Heritage craftsmanship delivered worldwide.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {[
                {
                  label: 'Instagram',
                  href: 'https://instagram.com',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                  )
                },
                {
                  label: 'Facebook',
                  href: 'https://facebook.com',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                  )
                },
                { label: 'WhatsApp', href: 'https://wa.me/919999988888', icon: <MessageCircle size={18} /> },
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

          {/* Shop Sections */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-6 text-lg italic">Shop</h4>
            <ul className="space-y-4 text-sm text-brand-200">
              <li><Link href="/shop" className="hover:text-white transition-colors">The Full Collection</Link></li>
              <li><Link href="/shop?category=personalized" className="hover:text-white transition-colors">Custom Engravings</Link></li>
              <li><Link href="/shop?category=best-sellers" className="hover:text-white transition-colors">Bestselling Classics</Link></li>
              <li><Link href="/shop?category=corporate" className="hover:text-white transition-colors">Corporate Gifting</Link></li>
              <li><Link href="/shop?category=new-arrivals" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/gift-cards" className="hover:text-white transition-colors">Gift Cards</Link></li>
            </ul>
          </div>

          {/* Collections Section */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-6 text-lg italic">Collections</h4>
            <ul className="space-y-4 text-sm text-brand-200">
              <li><Link href="/shop?for=husband" className="hover:text-white transition-colors">Gifts for Him</Link></li>
              <li><Link href="/shop?for=wife" className="hover:text-white transition-colors">Gifts for Her</Link></li>
              <li><Link href="/shop?for=kids" className="hover:text-white transition-colors">For the Little Ones</Link></li>
              <li><Link href="/shop?category=anniversary" className="hover:text-white transition-colors">Anniversary Specials</Link></li>
              <li><Link href="/shop?category=birthday" className="hover:text-white transition-colors">Birthday Treasures</Link></li>
              <li><Link href="/shop?category=festive" className="hover:text-white transition-colors">Festive Gifting</Link></li>
            </ul>
          </div>

          {/* Support & Community */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-6 text-lg italic">Help</h4>
            <ul className="space-y-4 text-sm text-brand-200">
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ & Care Guide</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Get in Touch</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/bulk" className="hover:text-white transition-colors">Bulk & Corporate Orders</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Journal</Link></li>
              <li><Link href="/custom" className="hover:text-white transition-colors">Custom Engraving</Link></li>
            </ul>
          </div>

        </div>

        {/* Newsletter & Trust Badges Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center py-12 border-t border-brand-800">
          <div className="lg:col-span-2">
            <h4 className="font-heading font-semibold text-white mb-2 text-2xl italic">Join the Pretty Luxe Atelier Circle</h4>
            <p className="text-sm text-brand-300 mb-6 max-w-lg">Get first access to new product drops, personalized gifting ideas, and exclusive offers from our studio.</p>
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
                  Join the Circle <Send size={14} />
                </button>
              </form>
            )}
          </div>
          <div className="flex flex-wrap justify-start lg:justify-end gap-8 text-brand-400">
            <div className="flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-tighter">
              <div className="w-12 h-12 rounded-full border border-brand-800 flex items-center justify-center mb-1 text-brand-400">
                <Globe size={20} />
              </div>
              <span>Ships Worldwide</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-tighter">
              <div className="w-12 h-12 rounded-full border border-brand-800 flex items-center justify-center mb-1 text-brand-400">
                <Leaf size={20} />
              </div>
              <span>Eco-Friendly</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-tighter">
              <div className="w-12 h-12 rounded-full border border-brand-800 flex items-center justify-center mb-1 text-brand-400">
                <Sparkles size={20} />
              </div>
              <span>Hand-Guided</span>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-800 pt-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left text-[11px] font-medium text-brand-400 gap-4 uppercase tracking-wider">
          <p>© {new Date().getFullYear()} Pretty Luxe Atelier Studio. Crafted with love for your legacy.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
