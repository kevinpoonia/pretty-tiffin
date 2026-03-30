'use client';

import { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Users, Package, Settings, LogOut, TrendingUp, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex h-screen bg-brand-50">
      
      {/* Sidebar */}
      <aside className="w-64 bg-brand-900 text-brand-100 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-brand-800">
          <span className="font-heading font-bold text-2xl tracking-tight text-white">
            Pretty<span className="text-brand-400">Tiffin<span className="text-xs uppercase ml-2 px-2 py-1 bg-brand-800 rounded">Admin</span></span>
          </span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-brand-500 text-white' 
                  : 'hover:bg-brand-800 hover:text-white'
              }`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-brand-300 hover:bg-brand-800 hover:text-white transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-brand-200 flex items-center px-6 justify-between">
          <h2 className="font-heading font-semibold text-lg text-brand-900 capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-brand-200 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                   { title: 'Total Revenue', value: '₹12.4L', icon: DollarSign, trend: '+14%' },
                   { title: 'Orders', value: '842', icon: ShoppingCart, trend: '+5%' },
                   { title: 'Avg Order Value', value: '₹1,580', icon: TrendingUp, trend: '+2%' },
                   { title: 'Customers', value: '1,204', icon: Users, trend: '+18%' },
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-brand-100 flex items-start justify-between">
                     <div>
                       <p className="text-sm font-medium text-brand-500 mb-1">{stat.title}</p>
                       <h3 className="text-3xl font-heading font-bold text-brand-900">{stat.value}</h3>
                       <p className="text-xs font-semibold text-green-600 mt-2">{stat.trend} from last month</p>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                       <stat.icon size={20} />
                     </div>
                   </div>
                 ))}
               </div>

               <div className="bg-white rounded-2xl shadow-sm border border-brand-100">
                  <div className="p-6 border-b border-brand-100">
                    <h3 className="font-heading font-bold text-brand-900">Recent Orders</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-brand-50 text-brand-600 text-xs uppercase tracking-wider">
                          <th className="p-4 font-semibold">Order ID</th>
                          <th className="p-4 font-semibold">Date</th>
                          <th className="p-4 font-semibold">Customer</th>
                          <th className="p-4 font-semibold">Status</th>
                          <th className="p-4 font-semibold text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-100 text-sm text-brand-800">
                        {[1, 2, 3, 4, 5].map((order) => (
                          <tr key={order} className="hover:bg-brand-50/50">
                            <td className="p-4 font-medium text-brand-900">#{1000 + order}</td>
                            <td className="p-4 text-brand-600">Oct {10 + order}, 2026</td>
                            <td className="p-4">John Doe</td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold uppercase tracking-wider">Processing</span>
                            </td>
                            <td className="p-4 text-right font-medium text-brand-900">₹1,499</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}

          {activeTab !== 'overview' && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-brand-400">
              <Package size={48} className="mb-4 opacity-50" />
              <p className="font-heading font-medium text-lg">Under Construction</p>
              <p className="text-sm">This module will be connected to the backend soon.</p>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
