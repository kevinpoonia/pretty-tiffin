'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Package, Truck, CheckCircle2, MapPin, Search } from 'lucide-react';
import { useState } from 'react';

const STEPS = [
  { icon: CheckCircle2, label: 'Order Placed', time: 'Oct 12, 10:30 AM', done: true, active: false },
  { icon: Package, label: 'Personalization & Packing', time: 'Your custom engraving is being applied. Oct 13, 02:15 PM', done: true, active: false },
  { icon: Truck, label: 'Dispatched', time: 'Left our facility. Arriving soon via BlueDart. Oct 14, 09:00 AM', done: false, active: true },
  { icon: MapPin, label: 'Out for Delivery', time: 'Pending', done: false, active: false },
];

export default function TrackOrderPage() {
  const [tracked, setTracked] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [input, setInput] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setOrderId(input.trim());
    setTracked(true);
  };

  return (
    <div className="bg-[#f5f3ed] min-h-screen">
      <Navbar alwaysSolid />
      <main className="container mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Track Your Order</h1>
          <p className="text-gray-500 text-sm">Get real-time shipping updates for your Pretty Luxe Atelier order</p>
        </div>

        {!tracked ? (
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <p className="text-sm text-gray-600 mb-6 text-center">
              Enter your Order ID (e.g. PT102345) or Email to get live shipping updates.
            </p>
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Order ID / Email Address"
                  required
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="w-full border border-gray-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 bg-brand-50 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
              >
                TRACK ORDER
              </button>
            </form>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5 mb-8">
              <div>
                <h2 className="font-bold text-xl text-gray-900">Order #{orderId || 'PT102345'}</h2>
                <p className="text-sm text-gray-500 mt-1">Placed on Oct 12, 2026</p>
              </div>
              <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider w-fit">
                In Transit
              </span>
            </div>

            <div className="relative pl-6 space-y-8">
              <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-gray-100" />

              {STEPS.map((step, i) => (
                <div key={i} className={`relative flex gap-5 ${!step.done && !step.active ? 'opacity-40' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white shadow ${
                    step.active ? 'bg-brand-500 ring-4 ring-brand-100' : step.done ? 'bg-brand-500' : 'bg-gray-300'
                  }`}>
                    <step.icon size={12} className="text-white" />
                  </div>
                  <div className="-mt-0.5">
                    <h3 className={`font-bold text-base ${step.active ? 'text-brand-500' : 'text-gray-800'}`}>
                      {step.label}{step.active ? ' (Current)' : ''}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setTracked(false); setInput(''); setOrderId(''); }}
              className="mt-10 text-sm text-brand-500 font-semibold hover:underline"
            >
              Track another order
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
