'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Package, MapPin, Settings, LogOut, ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AccountDashboard() {
  const [activeTab, setActiveTab] = useState('orders');

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
                    JD
                  </div>
                  <h2 className="font-heading font-bold text-brand-900">John Doe</h2>
                  <p className="text-sm text-brand-600">john@example.com</p>
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
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-colors">
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
                    <h2 className="text-2xl font-bold font-heading text-brand-900 mb-6">Recent Orders</h2>
                    
                    {[1, 2].map((order) => (
                      <div key={order} className="bg-white rounded-3xl p-6 shadow-sm border border-brand-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-brand-100 pb-4 mb-4 gap-4">
                          <div>
                            <p className="text-xs text-brand-500 font-semibold mb-1 uppercase tracking-wider">Order #{1000 + order}</p>
                            <p className="text-sm text-brand-700">Placed on Oct {10 + order}, 2026</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full tracking-wider">Delivered</span>
                            <p className="font-bold text-brand-900">₹1,499</p>
                          </div>
                        </div>

                        <div className="flex gap-4 items-center">
                          <div className="w-20 h-20 rounded-xl bg-brand-100 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-heading font-semibold text-brand-900">The Executive 3-Tier</h4>
                            <p className="text-sm text-brand-600 mt-1">Color: Premium Gold</p>
                            <p className="text-xs text-brand-500 mt-1">Engraving: "Aarav"</p>
                          </div>
                          <Link href={`/shop`} className="hidden md:flex items-center gap-2 text-sm font-medium text-brand-600 border border-brand-200 px-4 py-2 rounded-lg hover:bg-brand-50">
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
                      <button className="bg-brand-900 text-white px-4 py-2 text-sm font-medium rounded-lg">Add New</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-500 relative">
                        <div className="absolute top-4 right-4 bg-brand-100 text-brand-700 text-xs font-bold px-2 py-1 rounded">DEFAULT</div>
                        <h4 className="font-heading font-bold text-brand-900 mb-2">Home</h4>
                        <p className="text-sm text-brand-700 mb-1">John Doe</p>
                        <p className="text-sm text-brand-600 leading-relaxed mb-4">
                          123, Palm Grove Apartments<br />
                          Bandra West, Mumbai<br />
                          Maharashtra 400050<br />
                          Ph: +91 98765 43210
                        </p>
                        <div className="flex gap-3 text-sm font-medium">
                          <button className="text-brand-600 hover:text-brand-900">Edit</button>
                          <button className="text-red-500 hover:text-red-700">Delete</button>
                        </div>
                      </div>
                    </div>
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
