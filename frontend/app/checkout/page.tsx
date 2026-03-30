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

  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', phone: '', email: '', 
    address: '', city: '', state: '', pincode: ''
  });

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Require Login
  if (!authLoading && !user) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }

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
        theme: { color: '#ef4444' } // IGP Red
      };

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

  if (cartLoading || authLoading) return <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-8"><p className="animate-pulse font-bold text-gray-500">Loading Secure Checkout...</p></div>;

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <Navbar alwaysSolid />
      <main className="container mx-auto px-4 md:px-6 py-8">
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Secure Checkout</h1>
        {error && <div className="mb-4 bg-red-100 text-red-600 p-3 rounded text-sm font-semibold">{error}</div>}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Checkout Flow */}
          <div className="flex-1 space-y-6">
            
            {/* Contact Info (Step 1) */}
            <div className="bg-white rounded shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-gray-800">1. Contact Information</h2>
                {step > 1 && <button onClick={() => setStep(1)} className="text-red-500 text-sm font-semibold hover:underline">Edit</button>}
              </div>
              
              {step === 1 ? (
                 <div className="space-y-4">
                   <div className="p-4 bg-green-50 text-green-700 font-semibold rounded border border-green-200">
                     ✓ Logged in as: {user?.email}
                   </div>
                   <button onClick={() => setStep(2)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded transition-colors text-sm">
                     CONTINUE TO SHIPPING
                   </button>
                 </div>
              ) : (
                <div className="text-sm text-gray-600">{user?.email}</div>
              )}
            </div>

            {/* Shipping Address (Step 2) */}
            <div className={`bg-white rounded shadow-sm border p-6 ${step === 2 ? 'border-red-500' : 'border-gray-100'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`font-bold text-lg ${step >= 2 ? 'text-gray-800' : 'text-gray-400'}`}>2. Delivery Address</h2>
                {step > 2 && <button onClick={() => setStep(2)} className="text-red-500 text-sm font-semibold hover:underline">Edit</button>}
              </div>

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="First Name" value={shipping.firstName} onChange={(e) => setShipping({...shipping, firstName: e.target.value})} className="border border-gray-300 px-4 py-2.5 rounded focus:outline-none focus:border-red-500" />
                    <input type="text" placeholder="Last Name" value={shipping.lastName} onChange={(e) => setShipping({...shipping, lastName: e.target.value})} className="border border-gray-300 px-4 py-2.5 rounded focus:outline-none focus:border-red-500" />
                  </div>
                  <input type="text" placeholder="Street Address" value={shipping.address} onChange={(e) => setShipping({...shipping, address: e.target.value})} className="w-full border border-gray-300 px-4 py-2.5 rounded focus:outline-none focus:border-red-500" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="City" value={shipping.city} onChange={(e) => setShipping({...shipping, city: e.target.value})} className="border border-gray-300 px-4 py-2.5 rounded focus:outline-none focus:border-red-500" />
                    <input type="text" placeholder="PIN Code" value={shipping.pincode} onChange={(e) => setShipping({...shipping, pincode: e.target.value})} className="border border-gray-300 px-4 py-2.5 rounded focus:outline-none focus:border-red-500" />
                  </div>
                  <input type="tel" placeholder="Mobile Number" value={shipping.phone} onChange={(e) => setShipping({...shipping, phone: e.target.value})} className="w-full border border-gray-300 px-4 py-2.5 rounded focus:outline-none focus:border-red-500" />
                  
                  <button onClick={() => setStep(3)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded transition-colors text-sm mt-4">
                    CONTINUE TO PAYMENT
                  </button>
                </div>
              )}
              {step > 2 && (
                <div className="text-sm text-gray-600">
                  {shipping.firstName} {shipping.lastName}, {shipping.address}, {shipping.city} - {shipping.pincode}
                </div>
              )}
            </div>

            {/* Payment Options (Step 3) */}
            <div className={`bg-white rounded shadow-sm border p-6 ${step === 3 ? 'border-red-500' : 'border-gray-100'}`}>
              <h2 className={`font-bold text-lg mb-4 ${step === 3 ? 'text-gray-800' : 'text-gray-400'}`}>3. Payment</h2>
              
              {step === 3 && (
                <div className="space-y-4">
                  <div className="border border-red-500 bg-red-50 rounded p-4 flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-[0_0_0_1px_#ef4444]"></div>
                      <span className="font-semibold text-gray-800">Razorpay (UPI, Cards, NetBanking, Wallets)</span>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded p-4 flex items-center justify-between opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border border-gray-400"></div>
                      <span className="font-medium text-gray-600">Cash on Delivery (Unavailable for Customized Items)</span>
                    </div>
                  </div>

                  <button 
                    disabled={loading || items.length === 0}
                    onClick={handlePayment} 
                    className="w-full bg-red-500 hover:bg-red-600 focus:bg-red-700 disabled:opacity-50 text-white font-bold py-4 px-4 rounded transition-colors text-sm mt-6 shadow-md"
                  >
                    {loading ? 'INITIALIZING PAYMENT...' : `PAY ₹${total} SECURELY`}
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Cart Summary Side Panel */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded shadow-sm border border-gray-100 p-6 sticky top-28">
              <h2 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-16 h-16 bg-red-50 rounded flex-shrink-0 relative overflow-hidden">
                      <Image src={item.imageUrl || "/images/product-1.png"} alt={item.name} fill className="object-cover mix-blend-multiply" />
                      <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold">{item.quantity}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-800 line-clamp-2">{item.name}</h4>
                      <p className="font-bold text-sm mt-1 text-gray-900">₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping charges</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-red-600 border-t border-gray-100 pt-3">
                  <span>Total Due</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                 <span>100% Secure Checkout</span>
                 <Image src="/images/hero.png" width={100} height={20} alt="Payment Methods" className="opacity-50" />
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
