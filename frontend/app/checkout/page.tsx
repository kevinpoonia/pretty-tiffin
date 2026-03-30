'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CreditCard, Truck, Receipt, Lock } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  return (
    <>
      <Navbar alwaysSolid />
      <main className="flex-1 bg-brand-50 pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12">
            
            {/* Left: Checkout Flow */}
            <div className="w-full lg:w-2/3">
              <h1 className="text-3xl font-bold font-heading text-brand-900 mb-8">Secure Checkout</h1>
              
              {/* Steps Indicator */}
              <div className="flex items-center gap-4 mb-10">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-brand-900' : 'text-brand-400'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-brand-900 text-white' : 'bg-brand-200'}`}>1</span>
                  <span className="font-heading font-medium text-sm">Shipping</span>
                </div>
                <div className="flex-1 h-px bg-brand-200" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-brand-900' : 'text-brand-400'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-brand-900 text-white' : 'bg-brand-200'}`}>2</span>
                  <span className="font-heading font-medium text-sm">Payment</span>
                </div>
              </div>

              {/* Step 1: Shipping */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-brand-100">
                  <h2 className="text-xl font-heading font-semibold text-brand-900 flex items-center gap-3">
                    <Truck size={20} className="text-brand-500" /> Contact & Shipping
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Email</label>
                      <input type="email" placeholder="john@example.com" className="w-full bg-brand-50 border border-brand-200 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Phone</label>
                      <input type="tel" placeholder="+91 xxxxx xxxxx" className="w-full bg-brand-50 border border-brand-200 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Full Name</label>
                      <input type="text" placeholder="John Doe" className="w-full bg-brand-50 border border-brand-200 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Street Address</label>
                      <input type="text" placeholder="House/Flat No., Street" className="w-full bg-brand-50 border border-brand-200 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-brand-600 uppercase tracking-wider">City</label>
                      <input type="text" placeholder="Mumbai" className="w-full bg-brand-50 border border-brand-200 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-brand-600 uppercase tracking-wider">PIN Code</label>
                      <input type="text" placeholder="400001" className="w-full bg-brand-50 border border-brand-200 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500" />
                    </div>
                  </div>
                  
                  <div className="pt-6 flex justify-end">
                    <button onClick={() => setStep(2)} className="bg-brand-900 text-white px-8 py-4 rounded-full font-medium hover:bg-brand-800 transition-all flex items-center gap-2">
                      Continue to Payment
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-brand-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-heading font-semibold text-brand-900 flex items-center gap-3">
                      <CreditCard size={20} className="text-brand-500" /> Payment Method
                    </h2>
                    <button onClick={() => setStep(1)} className="text-sm text-brand-500 hover:text-brand-900 font-medium cursor-pointer">Edit Shipping</button>
                  </div>

                  <div className="space-y-4">
                    {/* Razorpay (UPI, Cards, Netbanking) */}
                    <label className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-colors ${paymentMethod === 'UPI' ? 'border-brand-500 bg-brand-50' : 'border-brand-100 hover:border-brand-300'}`}>
                      <input type="radio" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="mt-1 w-4 h-4 text-brand-500" />
                      <div>
                        <h3 className="font-heading font-semibold text-brand-900">UPI / UPI Apps / Cards / Netbanking</h3>
                        <p className="text-sm text-brand-600 mt-1">Secure payment via Razorpay. Supported: GPay, PhonePe, Paytm, Visa, Mastercard.</p>
                      </div>
                    </label>

                    {/* COD */}
                    <label className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-brand-500 bg-brand-50' : 'border-brand-100 hover:border-brand-300'}`}>
                      <input type="radio" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="mt-1 w-4 h-4 text-brand-500" />
                      <div>
                        <h3 className="font-heading font-semibold text-brand-900">Cash on Delivery (COD)</h3>
                        <p className="text-sm text-brand-600 mt-1">Pay when you receive the package. Only available for orders under ₹5,000.</p>
                      </div>
                    </label>
                  </div>

                  <div className="pt-6">
                    <button className="w-full bg-brand-900 text-white px-8 py-4 rounded-full font-medium hover:bg-brand-800 transition-all shadow-xl shadow-brand-900/10 flex items-center justify-center gap-2">
                       <Lock size={16} /> Complete Order — ₹1,499
                    </button>
                    <p className="text-center text-xs text-brand-500 mt-4">Your connection is 256-bit encrypted and secure.</p>
                  </div>

                </motion.div>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100 sticky top-28">
                <h2 className="text-lg font-heading font-semibold text-brand-900 mb-6 flex items-center gap-2">
                  <Receipt size={18} className="text-brand-500" /> Order Summary
                </h2>
                
                {/* Items */}
                <div className="space-y-4 mb-6">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-brand-100 rounded-xl flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-brand-900 text-sm">The Executive 3-Tier</h4>
                      <p className="text-xs text-brand-600 mt-1">Color: Premium Gold <br/> Engraving: "Aarav"</p>
                      <p className="font-medium text-brand-900 mt-2">₹1,499 x 1</p>
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-brand-100 pt-4 space-y-3">
                  <div className="flex justify-between text-sm text-brand-700">
                    <span>Subtotal</span>
                    <span>₹1,499</span>
                  </div>
                  <div className="flex justify-between text-sm text-brand-700">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-sm bg-brand-50 p-2 rounded text-brand-700">
                    <span>Discount (WELCOME10)</span>
                    <span className="text-brand-500">-₹149</span>
                  </div>
                  <div className="flex justify-between font-heading font-bold text-lg text-brand-900 pt-2 border-t border-brand-100">
                    <span>Total</span>
                    <span>₹1,350</span>
                  </div>
                </div>

                <div className="mt-8 flex gap-2">
                  <input type="text" placeholder="Promo code" className="w-full bg-brand-50 border border-brand-200 px-4 py-2 rounded-lg focus:outline-none focus:border-brand-500 text-sm" />
                  <button className="bg-brand-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-800">Apply</button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
