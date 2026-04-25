'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search, Truck, Heart, Menu, X, LogOut, Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useCurrency, CURRENCIES } from '@/context/CurrencyContext';

export default function Navbar({ alwaysSolid = true }: { alwaysSolid?: boolean }) {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { currency, setCurrency, currencyInfo } = useCurrency();
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearch, setMobileSearch] = useState('');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (query: string) => {
    const q = query.trim();
    if (!q) return;
    router.push(`/shop?search=${encodeURIComponent(q)}`);
    setSearchQuery('');
    setMobileSearch('');
  };

  const handleSearchKey = (e: KeyboardEvent<HTMLInputElement>, value: string) => {
    if (e.key === 'Enter') handleSearch(value);
  };

  const navCategories = [
    { label: 'Tiffins', href: '/shop?category=tiffins', highlight: true },
    { label: 'Kitchenware', href: '/shop?category=kitchenware' },
    { label: 'Apparels', href: '/shop?category=apparels' },
    { label: 'Corporate Gifts', href: '/shop?category=corporate' },
    { label: 'New Arrivals', href: '/shop?category=new-arrivals' },
    { label: 'Best Sellers', href: '/shop?category=best-sellers' },
  ];

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* Top Banner Strip */}
      <div className="bg-brand-500 text-brand-50 hidden lg:block overflow-hidden relative border-b border-brand-600">
        <div className="container mx-auto px-4 md:px-6 h-10 flex items-center justify-between text-[10px] font-bold tracking-[0.2em] relative z-10 uppercase">
          <div className="flex items-center gap-4 text-brand-100">
            <span>✨ TIFFINS · KITCHENWARE · APPARELS — CRAFTED IN INDIA</span>
          </div>
          <div className="flex items-center gap-6 text-brand-100">
            <Link href="/track" className="hover:text-white flex items-center gap-2 transition-colors">
              <Truck size={12} /> TRACK YOUR ORDER
            </Link>
            <span className="text-brand-300">|</span>
            <span>🌍 WORLDWIDE SHIPPING</span>
          </div>
        </div>
      </div>

      {/* Main Header Area */}
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3 md:gap-4 lg:gap-8">
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-gray-800 p-1 -ml-1"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <Link href="/" className="flex-shrink-0 group">
            <span className="font-heading text-xl sm:text-2xl lg:text-3xl text-stone-800 group-hover:text-brand-500 transition-colors uppercase tracking-tight">
              Pretty Luxe<span className="text-brand-500">Atelier</span>
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 min-w-0 max-w-xl relative">
          <div className={`w-full flex items-center border ${searchFocused ? 'border-brand-500 bg-white' : 'border-brand-100 bg-brand-50/50'} rounded-none text-sm transition-all duration-500 px-1`}>
            <input
              ref={searchRef}
              type="text"
              placeholder="Seeking something special?"
              className="w-full py-2.5 px-5 outline-none rounded-none text-stone-800 placeholder-stone-400 bg-transparent"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => handleSearchKey(e, searchQuery)}
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              className="w-10 h-10 bg-brand-500 hover:bg-brand-600 text-white rounded-none transition-all duration-500 flex items-center justify-center shrink-0 shadow-sm"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-4 lg:gap-5 shrink-0">

          {/* Currency Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setCurrencyOpen(p => !p)}
              onBlur={() => setTimeout(() => setCurrencyOpen(false), 150)}
              className="flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-brand-600 transition-colors px-2 py-1 rounded-lg hover:bg-brand-50"
            >
              <Globe size={14} />
              <span>{currencyInfo.code}</span>
              <ChevronDown size={12} className={`transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {currencyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-2 max-h-72 overflow-y-auto">
                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 px-2 py-1.5">Select Currency</p>
                    {CURRENCIES.map(c => (
                      <button
                        key={c.code}
                        onClick={() => { setCurrency(c.code); setCurrencyOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-colors flex items-center justify-between ${
                          currency === c.code ? 'bg-brand-50 text-brand-700 font-bold' : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="font-mono text-[10px] text-stone-400">{c.code}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="group relative">
            <Link
              href={user ? '/account' : '/login'}
              className="flex items-center gap-2 text-gray-700 hover:text-brand-500 transition-colors"
            >
              <User size={24} strokeWidth={1.5} />
              <div className="hidden xl:block text-xs font-semibold">
                <p className="text-gray-500 font-normal leading-tight">Profile</p>
                <p className="leading-tight">{user ? `Hi, ${user.name.split(' ')[0]}` : 'Login / Register'}</p>
              </div>
            </Link>

            {user && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-xl border border-gray-100 rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">My Account</Link>
                <Link href="/account/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">My Orders</Link>
                <Link href="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Wishlist</Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-brand-600 hover:bg-brand-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>

          <Link href="/wishlist" className="hidden md:flex flex-col items-center text-gray-700 hover:text-brand-500 transition-colors relative">
            <Heart size={24} strokeWidth={1.5} />
            <span className="hidden xl:block text-[10px] font-semibold mt-0.5">Wishlist</span>
          </Link>

          <Link href="/cart" className="flex items-center gap-2 text-gray-700 hover:text-brand-500 transition-colors relative">
            <div className="relative">
              <ShoppingCart size={24} strokeWidth={1.5} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <span className="hidden xl:block text-xs font-semibold mt-1">Cart</span>
          </Link>
        </div>
      </div>

      {/* Category Nav */}
      <nav className="hidden md:block bg-white border-t border-brand-100">
        <div className="container mx-auto px-4 md:px-6 overflow-x-auto no-scrollbar">
          <ul className="flex min-w-max items-center justify-center gap-10 lg:gap-14 text-xs font-bold text-stone-600 tracking-[0.2em] uppercase">
            {navCategories.map((cat, idx) => (
              <li key={idx} className="relative group">
                <Link
                  href={cat.href}
                  className={`block py-5 hover:text-brand-500 transition-all duration-500 ${cat.highlight ? 'text-brand-500' : ''}`}
                >
                  {cat.label}
                </Link>
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Search Bar */}
      <div className="md:hidden bg-white px-3 pb-3 border-t border-gray-100">
        <div className="w-full flex items-center border border-gray-200 rounded-lg text-sm bg-brand-50 focus-within:border-brand-500 transition-all">
          <input
            type="text"
            placeholder="Search for gifts..."
            className="w-full py-2.5 px-4 outline-none rounded-l-lg text-gray-800 bg-transparent placeholder-gray-400"
            value={mobileSearch}
            onChange={e => setMobileSearch(e.target.value)}
            onKeyDown={e => handleSearchKey(e, mobileSearch)}
          />
          <button
            onClick={() => handleSearch(mobileSearch)}
            className="bg-brand-500 text-white px-4 py-2.5 rounded-r-lg flex items-center justify-center shrink-0"
            aria-label="Search"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-[60] md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              className="w-[86vw] max-w-sm h-full bg-white shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100">
                <span className="font-heading text-xl text-gray-900 uppercase tracking-tight">
                  Pretty Luxe<span className="text-brand-500">Atelier</span>
                </span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 p-1" aria-label="Close menu">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <nav className="py-4">
                  {[
                    { label: 'Shop All', href: '/shop' },
                    { label: 'Tiffin Boxes', href: '/shop?category=tiffins' },
                    { label: 'Kitchenware', href: '/shop?category=kitchenware' },
                    { label: 'Apparels', href: '/shop?category=apparels' },
                    { label: 'Corporate Gifts', href: '/shop?category=corporate' },
                    { label: 'New Arrivals', href: '/shop?category=new-arrivals' },
                    { label: 'Best Sellers', href: '/shop?category=best-sellers' },
                    { label: 'Track Order', href: '/track' },
                  ].map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-6 py-3.5 text-gray-800 font-medium text-sm border-b border-gray-50 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Currency Selector */}
                <div className="px-6 py-4 border-t border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2"><Globe size={12} /> Currency</p>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 bg-white focus:outline-none focus:border-brand-400"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>

                <div className="px-6 py-4 border-t border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">My Account</p>
                  {user ? (
                    <>
                      <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-sm text-gray-700 font-medium hover:text-brand-500">My Account</Link>
                      <Link href="/account/orders" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-sm text-gray-700 font-medium hover:text-brand-500">My Orders</Link>
                      <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-sm text-gray-700 font-medium hover:text-brand-500">Wishlist</Link>
                      <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left py-2.5 text-sm text-brand-600 font-medium">Sign Out</button>
                    </>
                  ) : (
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-sm text-brand-600 font-semibold">Login / Register</Link>
                  )}
                </div>
              </div>

              <div className="p-5 bg-brand-50 border-t border-brand-100">
                <Link href="/track" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-brand-700 text-sm font-semibold">
                  <Truck size={16} /> Track Your Order
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
