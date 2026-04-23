'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, total, loading: cartLoading, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [razorpayReady, setRazorpayReady] = useState(false);

  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', phone: '', email: '', 
    address: '', city: '', state: '', pincode: ''
  });

  // Load Razorpay Script only when payment step is opened
  useEffect(() => {
    if (step < 3 || typeof window === 'undefined') return;
    if (window.Razorpay) {
      setRazorpayReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    script.onerror = () => setError('Unable to load payment gateway. Please refresh and try again.');
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [step]);

  // Require Login
  if (!authLoading && !user) {
    if (typeof window !== 'undefined') window.location.href = '/login?redirect=/checkout';
    return null;
  }

  const validateShipping = () => {
    const { firstName, lastName, address, city, pincode, phone } = shipping;
    if (!firstName.trim()) return 'First name is required';
    if (!lastName.trim()) return 'Last name is required';
    if (!address.trim()) return 'Address is required';
    if (!city.trim()) return 'City is required';
    if (!pincode.trim() || !/^\d{6}$/.test(pincode)) return 'Valid 6-digit PIN code is required';
    if (!phone.trim() || !/^\d{10}$/.test(phone.replace(/\s/g, ''))) return 'Valid 10-digit mobile number is required';
    return null;
  };

  const handleContinueToPayment = () => {
    const err = validateShipping();
    if (err) return setError(err);
    setError('');
    setStep(3);
  };

  const handlePayment = async () => {
    if (items.length === 0) return setError("Cart is empty");
    
    setLoading(true);
    setError('');

    try {
      // 1. Create Razorpay Order Intent
      const intentRes = await api.post('/orders/create-intent', { amount: total, currency: 'INR' });
      const order = intentRes.data;

      // 2. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'dummy_key',
        amount: order.amount,
        currency: order.currency,
        name: 'Pretty Tiffin',
        description: 'Premium Customized Tiffin',
        order_id: order.id,
        handler: async function (response: any) {
            try {
              // 3. Verify Payment & Create DB Order
              await api.post('/orders/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                totalAmount: total,
                paymentMethod: 'RAZORPAY',
                shippingAddress: shipping,
                items: items.map(i => ({
                  productId: i.productId,
                  quantity: i.quantity,
                  price: i.price,
                  customizationDetails: i.customization || {}
                }))
              });

              // 4. Success -> Clear Cart and redirect
              await clearCart();
              window.location.href = '/order-confirmation';
              
            } catch (err: any) {
              setError(err.response?.data?.error || 'Payment Verification Failed');
              setLoading(false);
            }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: shipping.phone
        },
        theme: { color: '#628f57' } // IGP Red
      };

      if (!window.Razorpay) {
         setError('Payment gateway is still loading. Please try again in a moment.');
         setLoading(false);
         return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
         setError("Payment Failed or Cancelled");
         setLoading(false);
      });
      rzp.open();

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  if (cartLoading || authLoading) return (
    <div className="min-h-screen bg-[#fdfaf6] flex flex-col items-center justify-center p-8 gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-brand-200 border-t-brand-900 animate-spin" />
      <p className="font-heading italic text-lg text-stone-500">Preparing your secure circle...</p>
    </div>
  );

  return (
    <div className="bg-[#fdfaf6] min-h-screen selection:bg-brand-200">
      <Navbar alwaysSolid />
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        
        <h1 className="text-4xl md:text-5xl font-heading italic text-stone-800 mb-10">Secure Checkout</h1>
        {error && <div className="mb-8 bg-red-50 text-red-600 p-4 rounded-2xl organic-shape-1 text-sm font-bold border border-red-100">{error}</div>}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Checkout Flow */}
          <div className="flex-1 space-y-6">
            
            {/* Contact Info (Step 1) */}
            <div className="bg-white rounded-[2.5rem] organic-shape-1 shadow-xl border border-brand-50 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading italic text-2xl text-stone-800">1. Information</h2>
                {step > 1 && <button onClick={() => setStep(1)} className="text-brand-500 text-xs font-bold uppercase tracking-widest hover:text-brand-700">Change</button>}
              </div>
              
              {step === 1 ? (
                 <div className="space-y-6">
                   <div className="p-6 bg-brand-50/50 text-stone-600 font-medium rounded-3xl border border-brand-100 italic">
                     Welcome back, {user?.email}. We&apos;re ready when you are.
                   </div>
                   <button onClick={() => setStep(2)} className="bg-brand-900 hover:bg-stone-800 text-white font-bold py-4 px-10 rounded-full transition-all duration-500 shadow-xl hover:scale-105 active:scale-95 tracking-widest text-xs uppercase">
                     Continue to Shipping
                   </button>
                 </div>
              ) : (
                <div className="text-sm text-stone-500 font-medium italic">{user?.email}</div>
              )}
            </div>

            {/* Shipping Address (Step 2) */}
            <div className={`bg-white rounded-[2.5rem] organic-shape-1 shadow-xl border p-8 transition-all duration-700 ${step === 2 ? 'border-brand-100 ring-4 ring-brand-50' : 'border-brand-50'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`font-heading italic text-2xl ${step >= 2 ? 'text-stone-800' : 'text-stone-300'}`}>2. Delivery</h2>
                {step > 2 && <button onClick={() => setStep(2)} className="text-brand-500 text-xs font-bold uppercase tracking-widest hover:text-brand-700">Change</button>}
              </div>

              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="First Name" value={shipping.firstName} onChange={(e) => setShipping({...shipping, firstName: e.target.value})} className="bg-brand-50/30 border border-brand-100 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-200 text-stone-800 placeholder-stone-400" />
                    <input type="text" placeholder="Last Name" value={shipping.lastName} onChange={(e) => setShipping({...shipping, lastName: e.target.value})} className="bg-brand-50/30 border border-brand-100 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-200 text-stone-800 placeholder-stone-400" />
                  </div>
                  <input type="text" placeholder="Street Address" value={shipping.address} onChange={(e) => setShipping({...shipping, address: e.target.value})} className="w-full bg-brand-50/30 border border-brand-100 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-200 text-stone-800 placeholder-stone-400" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="City" value={shipping.city} onChange={(e) => setShipping({...shipping, city: e.target.value})} className="bg-brand-50/30 border border-brand-100 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-200 text-stone-800 placeholder-stone-400" />
                    <input type="text" placeholder="PIN Code" value={shipping.pincode} onChange={(e) => setShipping({...shipping, pincode: e.target.value})} className="bg-brand-50/30 border border-brand-100 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-200 text-stone-800 placeholder-stone-400" />
                  </div>
                  <input type="tel" placeholder="Mobile Number" value={shipping.phone} onChange={(e) => setShipping({...shipping, phone: e.target.value})} className="w-full bg-brand-50/30 border border-brand-100 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-200 text-stone-800 placeholder-stone-400" />
                  
                  <button onClick={handleContinueToPayment} className="bg-brand-900 hover:bg-stone-800 text-white font-bold py-4 px-10 rounded-full transition-all duration-500 shadow-xl hover:scale-105 active:scale-95 tracking-widest text-xs uppercase mt-4">
                    Continue to Payment
                  </button>
                </div>
              )}
              {step > 2 && (
                <div className="text-sm text-stone-500 font-medium italic">
                  {shipping.firstName} {shipping.lastName}, {shipping.address}, {shipping.city} - {shipping.pincode}
                </div>
              )}
            </div>

            {/* Payment Options (Step 3) */}
            <div className={`bg-white rounded-[2.5rem] organic-shape-1 shadow-xl border p-8 transition-all duration-700 ${step === 3 ? 'border-brand-100 ring-4 ring-brand-50' : 'border-brand-50'}`}>
              <h2 className={`font-heading italic text-2xl mb-6 ${step === 3 ? 'text-stone-800' : 'text-stone-300'}`}>3. Secure Payment</h2>
              
              {step === 3 && (
                <div className="space-y-6">
                  <div className="border-2 border-brand-900 bg-brand-50/30 rounded-3xl p-6 flex items-center justify-between cursor-pointer shadow-inner">
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded-full bg-brand-900 border-4 border-white shadow-lg"></div>
                      <span className="font-bold text-stone-800">Artisanal Checkout (UPI, Cards, Wallets)</span>
                    </div>
                  </div>
                  <div className="border border-brand-50 rounded-3xl p-6 flex items-center justify-between opacity-30 cursor-not-allowed">
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded-full border-2 border-stone-300"></div>
                      <span className="font-medium text-stone-400">Cash on Delivery (Unavailable for Customized Items)</span>
                    </div>
                  </div>

                  <button 
                    disabled={loading || items.length === 0 || !razorpayReady}
                    onClick={handlePayment} 
                    className="w-full bg-brand-900 hover:bg-stone-800 focus:ring-4 focus:ring-brand-100 disabled:opacity-50 text-white font-bold py-5 px-6 rounded-full transition-all duration-700 text-xs uppercase tracking-widest mt-8 shadow-2xl hover:scale-[1.02] active:scale-95"
                  >
                    {loading ? 'INITIATING CIRCLE...' : !razorpayReady ? 'CRAFTING GATEWAY...' : `AUTHORIZE ₹${total.toLocaleString('en-IN')}`}
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Cart Summary Side Panel */}
          <div className="w-full lg:w-[26rem] flex-shrink-0">
            <div className="bg-white rounded-[2.5rem] organic-shape-1 shadow-2xl border border-brand-50 p-8 xl:sticky xl:top-32">
              <h2 className="font-heading italic text-2xl text-stone-800 mb-6 pb-4 border-b border-brand-50">Treasures</h2>
              
              <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto no-scrollbar">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="w-20 h-20 bg-brand-50 organic-shape-2 flex-shrink-0 relative overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-700">
                      <Image src={item.imageUrl || "/images/product-1.png"} alt={item.name} fill sizes="80px" className="object-contain p-2" />
                      <span className="absolute -top-1 -right-1 bg-stone-800 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold shadow-lg">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-heading italic text-base text-stone-800 line-clamp-1">{item.name}</h4>
                      <p className="font-sans font-bold text-sm text-stone-900 mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-8 pt-6 border-t border-brand-50">
                <div className="flex justify-between text-sm text-stone-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-stone-800">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-500 font-medium">
                  <span>Artisanal Shipping</span>
                  <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Complimentary</span>
                </div>
                <div className="flex justify-between font-sans font-bold text-2xl text-stone-900 border-t border-brand-50 pt-6 mt-6">
                  <span>Total Due</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-brand-50 flex items-center justify-center text-[10px] text-stone-400 font-bold uppercase tracking-widest gap-3 opacity-60">
                 <span>Safe & Secured Checkout</span>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
