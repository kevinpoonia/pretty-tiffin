import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-100 pt-16 pb-8 border-t border-brand-800 overflow-hidden w-full">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-heading font-bold text-2xl text-white tracking-tight">
                Pretty<span className="text-brand-400">Tiffin</span>
              </span>
            </Link>
            <p className="text-sm text-brand-200 leading-relaxed max-w-xs">
              Premium, engraved stainless steel tiffins designed for modern Indian lifestyles. Combining heritage with personalization.
            </p>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-3 text-sm text-brand-200">
              <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/custom" className="hover:text-white transition-colors">Customize Your Tiffin</Link></li>
              <li><Link href="/gift" className="hover:text-white transition-colors">Corporate Gifting</Link></li>
              <li><Link href="/gift-for-husband" className="hover:text-white transition-colors">Gifts for Husband</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-brand-200">
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Newsletter</h4>
            <p className="text-sm text-brand-200 mb-4">Subscribe for exclusive offers and new product drops.</p>
            <form className="flex w-full sm:max-w-sm rounded-md overflow-hidden border border-brand-700 focus-within:border-brand-500 transition-colors">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-brand-800 text-white px-4 py-2.5 flex-1 min-w-0 text-sm focus:outline-none placeholder-brand-400"
              />
              <button className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 text-sm font-medium transition-colors shrink-0">
                Join
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-brand-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-brand-300">
          <p>© {new Date().getFullYear()} Pretty Tiffin. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
