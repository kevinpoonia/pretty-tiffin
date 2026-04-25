'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, total, loading: cartLoading, clearCart } = useCart();
  const { formatPrice } = useCurrency();
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
        name: 'Pretty Luxe Atelier',
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
    <div className="min-h-screen bg-brand-50 flex flex-col items-center justify-center p-8 gap-4 font-sans">
      <div className="w-10 h-10 border-2 border-brand-200 border-t-brand-500 animate-spin" />
      <p className="font-heading text-lg text-stone-500 uppercase tracking-tight">Preparing your secure circle...</p>
    </div>
  );

  return (
    <div className="bg-brand-50 min-h-screen selection:bg-brand-200 font-sans">
      <Navbar alwaysSolid />
      <main className="container mx-auto px-4 md:px-6 pt-6 pb-12 md:pb-16">
        
        <h1 className="text-4xl md:text-5xl font-heading text-stone-800 mb-10 uppercase tracking-tight">Secure Checkout</h1>
        {error && <div className="mb-8 bg-red-50 text-red-600 p-4 rounded-none text-[10px] font-bold uppercase tracking-widest border border-red-100">{error}</div>}

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Checkout Flow */}
          <div className="flex-1 space-y-6">
            
            {/* Contact Info (Step 1) */}
            <div className="bg-white rounded-none shadow-sm border border-brand-100 p-8">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-brand-50">
                <h2 className="font-heading text-xl text-stone-900 uppercase tracking-tight">1. Information</h2>
                {step > 1 && <button onClick={() => setStep(1)} className="text-brand-500 text-[10px] font-bold uppercase tracking-widest hover:text-brand-700">Change</button>}
              </div>
              
              {step === 1 ? (
                 <div className="space-y-6">
                   <div className="p-6 bg-brand-50 text-stone-600 font-medium rounded-none border border-brand-100 uppercase tracking-widest text-[10px]">
                     Welcome back, {user?.email}. We&apos;re ready when you are.
                   </div>
                   <button onClick={() => setStep(2)} className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 px-12 rounded-none transition-all duration-500 shadow-sm tracking-[0.2em] text-[10px] uppercase">
                     Continue to Shipping
                   </button>
                 </div>
              ) : (
                <div className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">{user?.email}</div>
              )}
            </div>

            {/* Shipping Address (Step 2) */}
            <div className={`bg-white rounded-none shadow-sm border transition-all duration-700 p-8 ${step === 2 ? 'border-brand-500' : 'border-brand-100'}`}>
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-brand-50">
                <h2 className={`font-heading text-xl uppercase tracking-tight ${step >= 2 ? 'text-stone-900' : 'text-stone-300'}`}>2. Delivery</h2>
                {step > 2 && <button onClick={() => setStep(2)} className="text-brand-500 text-[10px] font-bold uppercase tracking-widest hover:text-brand-700">Change</button>}
              </div>

              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="First Name" value={shipping.firstName} onChange={(e) => setShipping({...shipping, firstName: e.target.value})} className="bg-brand-50 border border-brand-100 px-6 py-4 rounded-none focus:outline-none focus:ring-1 focus:ring-brand-500 text-stone-800 placeholder-stone-400 text-sm" />
                    <input type="text" placeholder="Last Name" value={shipping.lastName} onChange={(e) => setShipping({...shipping, lastName: e.target.value})} className="bg-brand-50 border border-brand-100 px-6 py-4 rounded-none focus:outline-none focus:ring-1 focus:ring-brand-500 text-stone-800 placeholder-stone-400 text-sm" />
                  </div>
                  <input type="text" placeholder="Street Address" value={shipping.address} onChange={(e) => setShipping({...shipping, address: e.target.value})} className="w-full bg-brand-50 border border-brand-100 px-6 py-4 rounded-none focus:outline-none focus:ring-1 focus:ring-brand-500 text-stone-800 placeholder-stone-400 text-sm" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="City" value={shipping.city} onChange={(e) => setShipping({...shipping, city: e.target.value})} className="bg-brand-50 border border-brand-100 px-6 py-4 rounded-none focus:outline-none focus:ring-1 focus:ring-brand-500 text-stone-800 placeholder-stone-400 text-sm" />
                    <input type="text" placeholder="PIN Code" value={shipping.pincode} onChange={(e) => setShipping({...shipping, pincode: e.target.value})} className="bg-brand-50 border border-brand-100 px-6 py-4 rounded-none focus:outline-none focus:ring-1 focus:ring-brand-500 text-stone-800 placeholder-stone-400 text-sm" />
                  </div>
                  <input type="tel" placeholder="Mobile Number" value={shipping.phone} onChange={(e) => setShipping({...shipping, phone: e.target.value})} className="w-full bg-brand-50 border border-brand-100 px-6 py-4 rounded-none focus:outline-none focus:ring-1 focus:ring-brand-500 text-stone-800 placeholder-stone-400 text-sm" />
                  
                  <button onClick={handleContinueToPayment} className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 px-12 rounded-none transition-all duration-500 shadow-sm tracking-[0.2em] text-[10px] uppercase mt-4">
                    Continue to Payment
                  </button>
                </div>
              )}
              {step > 2 && (
                <div className="text-[10px] text-stone-500 font-bold uppercase tracking-widest leading-relaxed">
                  {shipping.firstName} {shipping.lastName}<br />
                  {shipping.address}, {shipping.city} - {shipping.pincode}
                </div>
              )}
            </div>

            {/* Payment Options (Step 3) */}
            <div className={`bg-white rounded-none shadow-sm border transition-all duration-700 p-8 ${step === 3 ? 'border-brand-500' : 'border-brand-100'}`}>
              <h2 className={`font-heading text-xl uppercase tracking-tight mb-8 pb-4 border-b border-brand-50 ${step === 3 ? 'text-stone-900' : 'text-stone-300'}`}>3. Secure Payment</h2>
              
              {step === 3 && (
                <div className="space-y-6">
                  <div className="border border-brand-500 bg-brand-50 p-6 flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-none bg-brand-500 border border-brand-500 shadow-sm"></div>
                      <span className="font-bold text-stone-900 text-[10px] uppercase tracking-widest">Digital Payment (UPI, Cards, Wallets)</span>
                    </div>
                  </div>
                  <div className="border border-brand-50 p-6 flex items-center justify-between opacity-30 cursor-not-allowed">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-none border border-stone-300"></div>
                      <span className="font-bold text-stone-400 text-[10px] uppercase tracking-widest">Cash on Delivery (Unavailable)</span>
                    </div>
                  </div>

                  <button 
                    disabled={loading || items.length === 0 || !razorpayReady}
                    onClick={handlePayment} 
                    className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-5 px-10 rounded-none transition-all duration-700 text-[10px] uppercase tracking-[0.2em] mt-8 shadow-sm"
                  >
                    {loading ? 'INITIATING...' : !razorpayReady ? 'LOADING GATEWAY...' : `AUTHORIZE ${formatPrice(total)}`}
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Cart Summary Side Panel */}
          <div className="w-full lg:w-[26rem] flex-shrink-0">
            <div className="bg-white rounded-none shadow-sm border border-brand-100 p-8 xl:sticky xl:top-32">
              <h2 className="font-heading text-xl text-stone-900 mb-8 pb-4 border-b border-brand-50 uppercase tracking-tight">Treasures</h2>
              
              <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto no-scrollbar">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="w-20 h-20 bg-brand-50 flex-shrink-0 relative border border-brand-100 group-hover:scale-105 transition-transform duration-700">
                      <Image src={item.imageUrl || "/images/product-1.png"} alt={item.name} fill sizes="80px" className="object-contain p-2" />
                      <span className="absolute -top-2 -right-2 bg-stone-900 text-white text-[9px] w-6 h-6 flex items-center justify-center rounded-none font-bold">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-heading text-base text-stone-900 line-clamp-1 uppercase tracking-tight">{item.name}</h4>
                      <p className="font-sans font-bold text-sm text-stone-900 mt-1">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-8 pt-6 border-t border-brand-50">
                <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-stone-900">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className="text-brand-500">Complimentary</span>
                </div>
                <div className="flex justify-between font-sans font-bold text-2xl text-stone-900 border-t border-brand-50 pt-6 mt-6">
                  <span className="uppercase tracking-tight">Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-brand-50 flex items-center justify-center text-[9px] text-stone-400 font-bold uppercase tracking-widest gap-3 opacity-60">
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
