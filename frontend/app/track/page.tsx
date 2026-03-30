'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Package, Truck, CheckCircle2, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function TrackOrderPage() {
  const [tracked, setTracked] = useState(false);
  const [orderId, setOrderId] = useState('');

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <Navbar alwaysSolid />
      <main className="container mx-auto px-4 md:px-6 py-12">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Track Your Order</h1>
        
        {!tracked ? (
          <div className="max-w-md mx-auto bg-white rounded shadow-sm border border-gray-100 p-8">
             <p className="text-sm text-gray-600 mb-6 text-center">Enter your Order ID (e.g. PT102345) OR Email ID to get live shipping updates.</p>
             <form onSubmit={(e) => { e.preventDefault(); setTracked(true); }} className="space-y-4">
               <div>
                  <input type="text" placeholder="Order ID / Email Address" required value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-red-500" />
               </div>
               <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded transition-colors shadow-sm">
                  TRACK NOW
               </button>
             </form>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto bg-white rounded shadow-sm border border-gray-100 p-6 md:p-10">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-8">
              <div>
                <h2 className="font-bold text-xl text-gray-900">Order #{orderId || 'PT102345'}</h2>
                <p className="text-sm text-gray-500 mt-1">Placed on Oct 12, 2026</p>
              </div>
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">In Transit</span>
            </div>

            <div className="relative border-l-2 border-red-500 ml-4 md:ml-8 space-y-10 py-4">
               
               {/* Step 1 */}
               <div className="relative pl-8">
                 <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white border-4 border-white">
                   <CheckCircle2 size={16} />
                 </div>
                 <h3 className="font-bold text-gray-800 text-lg">Order Placed</h3>
                 <p className="text-sm text-gray-500">Oct 12, 10:30 AM</p>
               </div>

               {/* Step 2 */}
               <div className="relative pl-8">
                 <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white border-4 border-white">
                   <Package size={16} />
                 </div>
                 <h3 className="font-bold text-gray-800 text-lg">Personalization & Packing</h3>
                 <p className="text-sm text-gray-500">Your custom engraving is being applied.<br/>Oct 13, 02:15 PM</p>
               </div>

               {/* Step 3 */}
               <div className="relative pl-8">
                 <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white border-4 border-white animate-pulse shadow-[0_0_0_4px_rgba(239,68,68,0.2)]">
                   <Truck size={16} />
                 </div>
                 <h3 className="font-bold text-red-500 text-lg">Dispatched (Current)</h3>
                 <p className="text-sm text-gray-500">Left Mumbai facility. Arriving soon via BlueDart.<br/>Oct 14, 09:00 AM</p>
               </div>

               {/* Step 4 */}
               <div className="relative pl-8 opacity-40">
                 <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white border-4 border-white">
                   <MapPin size={16} />
                 </div>
                 <h3 className="font-bold text-gray-800 text-lg">Out for Delivery</h3>
                 <p className="text-sm text-gray-500">Pending</p>
               </div>

            </div>

            <button onClick={() => setTracked(false)} className="mt-10 text-sm text-red-500 font-semibold hover:underline">
              Track another order
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// Temporary icon
const MapPin = ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
