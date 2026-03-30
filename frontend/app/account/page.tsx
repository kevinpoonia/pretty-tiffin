'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Package, MapPin, Settings, LogOut, ArrowRight, Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AccountDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const { user, loading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setOrdersLoading(true);
      api.get('/orders').then(res => {
        setOrders(res.data || []);
      }).catch(() => {}).finally(() => setOrdersLoading(false));

      setAddressesLoading(true);
      api.get('/users/addresses').then(res => {
        setAddresses(res.data || []);
      }).catch(() => {}).finally(() => setAddressesLoading(false));
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-red-500" size={32} />
      </div>
    );
  }

  const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2);

  return (
    <>
      <Navbar alwaysSolid />
      <main className="flex-1 bg-brand-50 pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-4 md:px-6">
          
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-100 sticky top-28">
                <div className="mb-8 text-center">
                  <div className="w-20 h-20 bg-brand-200 rounded-full mx-auto flex items-center justify-center text-brand-700 font-heading font-bold text-2xl mb-3">
                    {initials}
                  </div>
                  <h2 className="font-heading font-bold text-brand-900">{user.name}</h2>
                  <p className="text-sm text-brand-600">{user.email}</p>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="mt-2 inline-block text-xs bg-red-100 text-red-600 font-bold px-2 py-1 rounded">ADMIN PANEL</Link>
                  )}
                </div>

                <nav className="space-y-2">
                  {[
                    { id: 'orders', label: 'My Orders', icon: Package },
                    { id: 'addresses', label: 'Addresses', icon: MapPin },
                    { id: 'wishlist', label: 'Wishlist', icon: Heart },
                    { id: 'settings', label: 'Settings', icon: Settings },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-brand-900 text-white shadow-md' 
                          : 'text-brand-700 hover:bg-brand-100 hover:text-brand-900'
                      }`}
                    >
                      <tab.icon size={18} /> {tab.label}
                    </button>
                  ))}
                  <div className="pt-4 mt-4 border-t border-brand-100">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold font-heading text-brand-900 mb-6">My Orders</h2>
                    {ordersLoading ? (
                      <div className="flex justify-center py-12"><Loader2 className="animate-spin text-red-500" size={28} /></div>
                    ) : orders.length === 0 ? (
                      <div className="bg-white rounded-3xl p-12 text-center border border-brand-100">
                        <Package size={40} className="mx-auto mb-4 text-brand-300" />
                        <h3 className="font-bold text-brand-700 mb-2">No orders yet</h3>
                        <p className="text-sm text-brand-500 mb-6">Start shopping and your orders will appear here.</p>
                        <Link href="/shop" className="bg-red-500 text-white px-6 py-2 rounded font-semibold text-sm hover:bg-red-600">Shop Now</Link>
                      </div>
                    ) : orders.map((order: any) => (
                      <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-brand-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-brand-100 pb-4 mb-4 gap-4">
                          <div>
                            <p className="text-xs text-brand-500 font-semibold mb-1 uppercase tracking-wider">Order #{order.id.slice(0,8).toUpperCase()}</p>
                            <p className="text-sm text-brand-700">Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider ${
                              order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                              order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>{order.status}</span>
                            <p className="font-bold text-brand-900">₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        <div className="flex gap-4 items-center">
                          <div className="flex-1">
                            {order.items?.map((item: any) => (
                              <p key={item.id} className="text-sm text-brand-700">{item.product?.name} × {item.quantity}</p>
                            ))}
                          </div>
                          <Link href="/shop" className="hidden md:flex items-center gap-2 text-sm font-medium text-brand-600 border border-brand-200 px-4 py-2 rounded-lg hover:bg-brand-50">
                            Reorder <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold font-heading text-brand-900">Saved Addresses</h2>
                      <button className="bg-brand-900 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-brand-800 transition-colors">Add New</button>
                    </div>

                    {addressesLoading ? (
                      <div className="flex justify-center py-12"><Loader2 className="animate-spin text-red-500" size={28} /></div>
                    ) : addresses.length === 0 ? (
                      <div className="bg-white rounded-3xl p-12 text-center border border-brand-100">
                        <MapPin size={40} className="mx-auto mb-4 text-brand-300" />
                        <h3 className="font-bold text-brand-700 mb-2">No addresses saved</h3>
                        <p className="text-sm text-brand-500">Add an address to speed up your checkout process.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((addr: any) => (
                          <div key={addr.id} className={`bg-white rounded-3xl p-6 shadow-sm border ${addr.isDefault ? 'border-brand-500 bg-brand-50/10' : 'border-brand-100'} relative`}>
                            {addr.isDefault && <div className="absolute top-4 right-4 bg-brand-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-sm">DEFAULT</div>}
                            <h4 className="font-heading font-black text-brand-900 mb-2">{addr.label || 'Home'}</h4>
                            <p className="text-sm text-brand-700 mb-1 font-bold">{user.name}</p>
                            <p className="text-sm text-brand-600 leading-relaxed mb-4">
                              {addr.street}<br />
                              {addr.city}, {addr.state}<br />
                              {addr.country} {addr.pincode}
                            </p>
                            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest pt-2 border-t border-brand-50 mt-2">
                              <button className="text-brand-500 hover:text-brand-900 transition-colors">Edit</button>
                              <button className="text-red-400 hover:text-red-600 transition-colors">Remove</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
