'use client';
 
import Link from 'next/link';
import { ShoppingCart, User, Search, MapPin, Truck, ChevronDown, Heart, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function Navbar({ alwaysSolid = true }: { alwaysSolid?: boolean }) {
  const { user, logout } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // IGP uses a prominent red branding color for primary actions. 
  // We'll adapt our theme to this style.
  
  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* Top Banner Strip */}
      <div className="bg-[#f7f7f7] text-[#333] hidden md:block border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6 h-8 flex items-center justify-between text-[11px] font-medium tracking-wide">
          <div className="flex items-center gap-4 text-red-600 font-semibold tracking-wider uppercase">
            <span>UP TO 20% OFF ON PERSONALIZED TIFFINS</span>
          </div>
          <div className="flex items-center gap-6 text-gray-600">
            <Link href="/track" className="hover:text-red-500 flex items-center gap-1">
              <Truck size={12} /> Track Order
            </Link>
            <div className="flex items-center gap-1 cursor-pointer hover:text-red-500">
              <MapPin size={12} /> Deliver to: <span className="text-gray-900 font-semibold">India</span> <ChevronDown size={10} />
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-red-500">
              INR <ChevronDown size={10} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Area */}
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4 md:gap-8">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Menu */}
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-gray-800">
            <Menu size={24} />
          </button>
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-heading font-extrabold text-3xl tracking-tight text-gray-900">
              Pretty<span className="text-red-500">Tiffin</span>
            </span>
          </Link>
        </div>

        {/* Huge Search Bar (Core to IGP design) */}
        <div className="hidden md:flex flex-1 max-w-3xl relative">
          <div className={`w-full flex items-center border ${searchFocused ? 'border-red-500 shadow-md' : 'border-gray-300'} rounded text-sm transition-all bg-white`}>
             <input 
               type="text" 
               placeholder="Search for custom tiffins, specific gifts, occasions..." 
               className="w-full py-2.5 px-4 outline-none rounded-l text-gray-800 placeholder-gray-400"
               onFocus={() => setSearchFocused(true)}
               onBlur={() => setSearchFocused(false)}
             />
             <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-r transition-colors flex items-center justify-center">
               <Search size={18} />
             </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <Link href="/track" className="md:hidden flex flex-col items-center text-gray-600 hover:text-red-500">
            <Search size={22} strokeWidth={1.5} />
          </Link>

          <div className="group relative">
            <Link href={user ? "/account" : "/login"} className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition-colors">
              <User size={24} strokeWidth={1.5} />
              <div className="hidden lg:block text-xs font-semibold">
                <p className="text-gray-500 font-normal leading-tight">Profile</p>
                <p className="leading-tight">{user ? `Hi, ${user.name.split(' ')[0]}` : 'Login / Register'}</p>
              </div>
            </Link>
            
            {user && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-xl border border-gray-100 rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Account</Link>
                <Link href="/account/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
          
          <Link href="/wishlist" className="hidden lg:flex flex-col items-center text-gray-700 hover:text-red-500 transition-colors relative">
             <Heart size={24} strokeWidth={1.5} />
             <span className="text-[10px] font-semibold mt-0.5">Shortlist</span>
          </Link>

          <Link href="/cart" className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition-colors relative">
            <div className="relative">
              <ShoppingCart size={24} strokeWidth={1.5} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                0
              </span>
            </div>
            <span className="hidden lg:block text-xs font-semibold mt-1">Cart</span>
          </Link>
        </div>
      </div>

      {/* Deep Category Navigation (IGP Style) */}
      <nav className="hidden md:block bg-white border-t border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 md:px-6">
          <ul className="flex items-center justify-center lg:justify-start gap-8 text-[13px] font-semibold text-gray-700">
            {['Same Day Delivery', 'Best Sellers', 'Personalized', 'Birthday', 'Anniversary', 'Corporate', 'Occasions'].map((cat, idx) => (
              <li key={idx} className="relative group">
                <Link href={`/shop?category=${cat.toLowerCase()}`} className={`block py-3 hover:text-red-500 transition-colors flex items-center gap-1 ${idx === 0 ? 'text-red-600' : ''}`}>
                  {cat} {idx > 1 && <ChevronDown size={12} className="text-gray-400 group-hover:text-red-500" />}
                </Link>
                {/* Minimal dropdown indicator line */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Search Bar (Appears below header on small screens) */}
      <div className="md:hidden bg-white p-3 border-t border-gray-100 shadow-sm">
         <div className="w-full flex items-center border border-gray-300 rounded text-sm bg-gray-50 focus-within:border-red-500 transition-all">
            <input 
              type="text" 
              placeholder="Search for custom tiffins, gifts..." 
              className="w-full py-2.5 px-4 outline-none rounded-l text-gray-800 bg-transparent placeholder-gray-500"
            />
            <button className="bg-red-500 text-white px-5 py-2.5 rounded-r flex items-center justify-center">
              <Search size={16} />
            </button>
         </div>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="w-4/5 max-w-[300px] h-full bg-white shadow-2xl flex flex-col pt-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
               <span className="font-heading font-extrabold text-2xl text-gray-900">
                 Pretty<span className="text-red-500">Tiffin</span>
               </span>
               <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500">
                 <X size={24} />
               </button>
            </div>
            <nav className="flex flex-col gap-6 px-6 text-base font-semibold text-gray-700">
               <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="border-b border-gray-50 pb-2">Shop All</Link>
               <Link href="/shop?category=personalized" onClick={() => setMobileMenuOpen(false)} className="border-b border-gray-50 pb-2">Personalized</Link>
               <Link href="/shop?category=best-sellers" onClick={() => setMobileMenuOpen(false)} className="border-b border-gray-50 pb-2">Best Sellers</Link>
               <Link href="/gift" onClick={() => setMobileMenuOpen(false)} className="border-b border-gray-50 pb-2">Gifting</Link>
               <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="border-b border-gray-50 pb-2">My Account</Link>
            </nav>
            <div className="mt-auto p-6 bg-red-50 text-red-600 text-sm font-semibold">
               <Link href="/track" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2"><Truck size={16}/> Track Order</Link>
            </div>
          </motion.div>
        </div>
      )}
    </header>
  );
}
