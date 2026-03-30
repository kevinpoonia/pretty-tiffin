'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, Package, Truck, Phone } from 'lucide-react';

export default function OrderConfirmationPage() {
  const orderId = "PT" + Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <Navbar alwaysSolid />
      <main className="container mx-auto px-4 md:px-6 py-12">
        
        <div className="max-w-3xl mx-auto bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Success Header */}
          <div className="bg-green-50/50 p-8 text-center border-b border-gray-100">
            <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">Thank you for your purchase. Your order has been placed successfully.</p>
            <p className="text-gray-900 font-bold text-lg mt-4">Order #{orderId}</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Delivery Details */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <MapPin size={18} className="text-red-500" /> Delivery To
                </h3>
                <p className="font-semibold text-sm text-gray-900 mb-1">John Doe</p>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                  123, Palm Grove Apartments<br />
                  Bandra West, Mumbai<br />
                  Maharashtra 400050
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1"><Phone size={14}/> +91 98765 43210</p>
              </div>

              {/* Delivery Estimate */}
              <div>
                 <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Truck size={18} className="text-red-500" /> Expected Delivery
                </h3>
                <div className="bg-gray-50 rounded p-4 border border-gray-100">
                  <p className="font-bold text-green-600 text-lg">Tomorrow</p>
                  <p className="text-xs text-gray-500 mt-1">Between 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center pt-8 border-t border-gray-100">
              <Link href="/track" className="w-full sm:w-auto px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded text-sm text-center shadow-sm transition-colors">
                TRACK ORDER
              </Link>
              <Link href="/shop" className="w-full sm:w-auto px-8 py-3 bg-white border border-gray-300 hover:border-red-500 text-gray-700 hover:text-red-500 font-bold rounded text-sm text-center transition-colors">
                CONTINUE SHOPPING
              </Link>
            </div>
          </div>

        </div>

      </main>
      <Footer />
    </div>
  );
}

// Temporary Icon definitions for missing lucide-react imports
const MapPin = ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
