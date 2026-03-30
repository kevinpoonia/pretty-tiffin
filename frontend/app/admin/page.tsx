'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, ShoppingCart, Users, Package, Settings, LogOut, 
  TrendingUp, DollarSign, Plus, Edit, Trash, Check, X, Loader2, Save, Filter,
  ChevronRight, ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  revenue: number;
}

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  
  // Product Form State
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', stock: '', category: '', slug: '', images: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/orders')
        ]);
        setStats(statsRes.data);
        setOrders(ordersRes.data.slice(0, 5));
      } else if (activeTab === 'orders') {
        const res = await api.get('/admin/orders');
        setOrders(res.data);
      } else if (activeTab === 'products') {
        const res = await api.get('/admin/products');
        setProducts(res.data);
      } else if (activeTab === 'customers') {
        const res = await api.get('/admin/customers');
        setCustomers(res.data);
      } else if (activeTab === 'banners') {
        const res = await api.get('/banners');
        setBanners(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [user, fetchData]);

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      fetchData();
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        images: productForm.images.split(',').map(s => s.trim()).filter(Boolean)
      };
      if (currentProduct) {
        await api.put(`/admin/products/${currentProduct.id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      setIsEditingProduct(false);
      setCurrentProduct(null);
      setProductForm({ name: '', description: '', price: '', stock: '', category: '', slug: '', images: '' });
      fetchData();
    } catch (err) {
      alert("Failed to save product");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Remove this banner?")) return;
    try {
      await api.delete(`/banners/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete banner");
    }
  };

  if (authLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-50">
        <Loader2 className="animate-spin text-brand-600" size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-brand-50 text-brand-900 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-brand-900 text-brand-100 flex flex-col hidden lg:flex border-r border-brand-800">
        <div className="p-8 border-b border-brand-800 flex items-center justify-between">
          <Link href="/" className="inline-block group">
            <span className="font-heading font-black text-2xl tracking-tighter text-white group-hover:text-brand-400 transition-colors">
              PRETTY<span className="text-brand-400 group-hover:text-white transition-colors underline decoration-brand-500 underline-offset-4">TIFFIN</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-10 px-6 space-y-3">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'banners', label: 'Banners', icon: TrendingUp },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsEditingProduct(false); }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm tracking-tight transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-brand-500 text-white shadow-2xl shadow-brand-500/40 translate-x-2' 
                  : 'text-brand-400 hover:bg-brand-800 hover:text-white hover:translate-x-1'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'animate-pulse' : ''} /> {item.label}
              {activeTab === item.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-brand-800">
          <button onClick={logout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm text-brand-400 hover:bg-red-500 hover:text-white transition-all group group-hover:shadow-lg">
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-brand-100 flex items-center px-10 justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-6">
             <button className="lg:hidden text-brand-900 bg-brand-50 p-3 rounded-2xl hover:bg-brand-100 transition-colors"><LayoutDashboard size={24} /></button>
             <div>
                <h2 className="font-heading font-black text-2xl text-brand-900 capitalize tracking-tighter">{activeTab}</h2>
                <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-0.5">Control Center / {activeTab}</p>
             </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
               <p className="text-xs font-black text-brand-900">{user.name}</p>
               <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Administrator</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-brand-100 to-brand-200 rounded-2xl flex items-center justify-center text-brand-800 font-black text-lg shadow-inner ring-2 ring-white">
              {user.name[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-10 bg-brand-50/50">
          
          {loading && activeTab !== 'overview' && (
            <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-brand-500" size={48} /></div>
          )}

          {!loading && (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      { title: 'Gross Revenue', value: stats?.revenue ? `₹${stats.revenue.toLocaleString('en-IN')}` : '₹0', icon: DollarSign, trend: '+14% Volume', color: 'bg-green-500', iconColor: 'text-green-500' },
                      { title: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, trend: '+5% Velocity', color: 'bg-blue-500', iconColor: 'text-blue-500' },
                      { title: 'SKU Count', value: stats?.totalProducts || 0, icon: Package, trend: 'Active Inventory', color: 'bg-purple-500', iconColor: 'text-purple-500' },
                      { title: 'Customer Base', value: stats?.totalUsers || 0, icon: Users, trend: '+18% Growth', color: 'bg-orange-500', iconColor: 'text-orange-500' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white p-8 rounded-[32px] shadow-sm border border-brand-100 flex flex-col gap-6 hover:shadow-2xl hover:shadow-brand-900/5 transition-all duration-500 group">
                        <div className="flex justify-between items-start">
                          <div className={`w-14 h-14 rounded-2xl ${stat.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                            <stat.icon size={24} />
                          </div>
                          <span className={`text-[10px] font-black px-3 py-1.5 rounded-full bg-brand-50 ${stat.iconColor} tracking-tighter`}>{stat.trend}</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-brand-400 mb-1 uppercase tracking-widest">{stat.title}</p>
                          <h3 className="text-3xl font-heading font-black text-brand-900 tracking-tighter">{stat.value}</h3>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-brand-100 overflow-hidden">
                      <div className="p-8 border-b border-brand-50 flex justify-between items-center">
                        <div>
                          <h3 className="font-heading font-black text-brand-900 text-lg tracking-tight">Recent Transactions</h3>
                          <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-1">Live order feed</p>
                        </div>
                        <button onClick={() => setActiveTab('orders')} className="text-[10px] font-black text-brand-500 hover:text-brand-900 uppercase tracking-widest bg-brand-50 px-4 py-2 rounded-full transition-colors">See Details</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-brand-50/30 text-brand-400 text-[10px] font-black uppercase tracking-widest">
                              <th className="px-8 py-5">Order Reference</th>
                              <th className="px-8 py-5">Client</th>
                              <th className="px-8 py-5">Status</th>
                              <th className="px-8 py-5 text-right">Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-50 text-sm text-brand-800">
                            {orders.map((order) => (
                              <tr key={order.id} className="hover:bg-brand-50/20 transition-colors group">
                                <td className="px-8 py-6">
                                  <p className="font-black text-brand-900 text-xs tracking-tighter group-hover:text-brand-600 transition-colors">#{order.id.slice(0,8).toUpperCase()}</p>
                                  <p className="text-[10px] font-bold text-brand-400 mt-1 uppercase">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                                </td>
                                <td className="px-8 py-6">
                                  <p className="font-black text-xs text-brand-900">{order.user?.name}</p>
                                  <p className="text-[10px] font-bold text-brand-400 uppercase truncate max-w-[120px]">{order.user?.email}</p>
                                </td>
                                <td className="px-8 py-6">
                                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                    order.status === 'DELIVERED' ? 'bg-green-500 text-white' :
                                    order.status === 'CANCELLED' ? 'bg-red-500 text-white' :
                                    'bg-brand-900 text-white'
                                  }`}>{order.status}</span>
                                </td>
                                <td className="px-8 py-6 text-right font-black text-brand-900 tracking-tighter">₹{Number(order.totalAmount).toLocaleString('en-IN')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-brand-900 rounded-[40px] p-8 text-white flex flex-col justify-between shadow-2xl shadow-brand-900/40 relative overflow-hidden group">
                       <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-800 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                       <div className="relative z-10">
                          <h4 className="font-heading font-black text-2xl tracking-tighter mb-4 leading-none">Administrative Insights</h4>
                          <p className="text-xs font-bold text-brand-300 leading-relaxed opacity-80">Platform health is currently optimal. Revenue is trending up compared to last cycle.</p>
                       </div>
                       <div className="relative z-10 mt-10 space-y-6">
                          <div className="flex items-center justify-between border-b border-white/10 pb-4">
                             <span className="text-[10px] font-black uppercase tracking-widest text-brand-400">Order Velocity</span>
                             <span className="text-xs font-black text-green-400">+12% / hr</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-white/10 pb-4">
                             <span className="text-[10px] font-black uppercase tracking-widest text-brand-400">Inventory Status</span>
                             <span className="text-xs font-black text-brand-200">92% Healthy</span>
                          </div>
                          <div className="pt-4">
                             <button className="w-full bg-white text-brand-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">Download Report</button>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex justify-between items-center bg-white p-8 rounded-[32px] shadow-sm border border-brand-50">
                    <div>
                      <h3 className="text-xl font-heading font-black text-brand-900 tracking-tight">Active Inventory</h3>
                      <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-1">Manage your storefront items</p>
                    </div>
                    <button 
                      onClick={() => { setIsEditingProduct(true); setCurrentProduct(null); setProductForm({ name: '', description: '', price: '', stock: '', category: '', slug: '', images: '' }); }}
                      className="bg-brand-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-brand-800 transition-all shadow-2xl shadow-brand-900/20 active:scale-95"
                    >
                      <Plus size={18} /> Add New SKU
                    </button>
                  </div>

                  {isEditingProduct && (
                    <div className="bg-white p-10 rounded-[40px] border border-brand-200 shadow-2xl mb-12 animate-in zoom-in-95 duration-500 relative">
                       <button onClick={() => setIsEditingProduct(false)} className="absolute top-6 right-6 p-3 rounded-2xl hover:bg-brand-50 text-brand-400 transition-colors"><X size={20}/></button>
                       <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-brand-900 text-white flex items-center justify-center"><Package size={24}/></div>
                          <h4 className="font-heading font-black text-2xl tracking-tighter text-brand-900">{currentProduct ? 'Modify Listing' : 'New Listing Entry'}</h4>
                       </div>
                       <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-400 ml-1">Product Title</label>
                             <input type="text" placeholder="e.g. The Executive 3-Tier" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-brand-50 border-none rounded-2xl p-5 text-sm font-bold text-brand-900 focus:ring-4 focus:ring-brand-500/10 transition-all" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-400 ml-1">Permanent Slug</label>
                             <input type="text" placeholder="e.g. executive-tiffin" required value={productForm.slug} onChange={e => setProductForm({...productForm, slug: e.target.value})} className="w-full bg-brand-50 border-none rounded-2xl p-5 text-sm font-bold text-brand-900 focus:ring-4 focus:ring-brand-500/10 transition-all" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-400 ml-1">Market Price (INR)</label>
                             <input type="number" placeholder="1499" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full bg-brand-50 border-none rounded-2xl p-5 text-sm font-black text-brand-900 focus:ring-4 focus:ring-brand-500/10 transition-all" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-400 ml-1">Available Units</label>
                             <input type="number" placeholder="50" required value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full bg-brand-50 border-none rounded-2xl p-5 text-sm font-bold text-brand-900 focus:ring-4 focus:ring-brand-500/10 transition-all" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-400 ml-1">Category Segment</label>
                             <input type="text" placeholder="e.g. Premium Tiffins" required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-brand-50 border-none rounded-2xl p-5 text-sm font-bold text-brand-900 focus:ring-4 focus:ring-brand-500/10 transition-all" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-400 ml-1">Visual Assets (CSV URLs)</label>
                             <input type="text" placeholder="https://image-url-1.com, ..." value={productForm.images} onChange={e => setProductForm({...productForm, images: e.target.value})} className="w-full bg-brand-50 border-none rounded-2xl p-5 text-sm font-bold text-brand-900 focus:ring-4 focus:ring-brand-500/10 transition-all" />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-400 ml-1">Marketing Description</label>
                             <textarea placeholder="Tell your brand story..." required value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-brand-50 border-none rounded-2xl p-5 text-sm font-medium text-brand-700 focus:ring-4 focus:ring-brand-500/10 transition-all" rows={4}></textarea>
                          </div>
                          <div className="md:col-span-2 flex gap-4 justify-end pt-4">
                             <button type="button" onClick={() => setIsEditingProduct(false)} className="px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-brand-500 hover:bg-brand-50 transition-colors">Discard</button>
                             <button type="submit" className="px-10 py-4 bg-brand-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-800 shadow-2xl shadow-brand-900/20 active:scale-95 flex items-center gap-3">
                                <Save size={18} /> Commit Listing
                             </button>
                          </div>
                       </form>
                    </div>
                  )}

                  <div className="bg-white rounded-[40px] shadow-sm border border-brand-100 overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-brand-50/30 text-brand-400 text-[10px] font-black uppercase tracking-widest">
                          <th className="px-8 py-5">Product Details</th>
                          <th className="px-8 py-5">Segment</th>
                          <th className="px-8 py-5">Value</th>
                          <th className="px-8 py-5 text-center">Stability</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-50 text-sm">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-brand-50/20 transition-all group">
                            <td className="px-8 py-6 flex items-center gap-5">
                              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex-shrink-0 relative overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                                {p.images?.[0] ? <Image src={p.images[0]} alt={p.name} fill className="object-cover" /> : <Package size={24} className="m-5 text-brand-200" />}
                              </div>
                              <div>
                                <p className="font-black text-brand-900 tracking-tight text-xs">{p.name}</p>
                                <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-1">/{p.slug}</p>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-500">{p.category}</td>
                            <td className="px-8 py-6 font-black text-brand-900 tracking-tight">₹{Number(p.price).toLocaleString('en-IN')}</td>
                            <td className="px-8 py-6 text-center">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                   {p.stock} Units
                                </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => { setIsEditingProduct(true); setCurrentProduct(p); setProductForm({ name: p.name, description: p.description, price: String(p.price), stock: String(p.stock), category: p.category, slug: p.slug, images: (p.images || []).join(', ') }); }} className="p-3 text-brand-400 hover:text-brand-900 bg-brand-50 rounded-xl hover:bg-brand-100 transition-all"><Edit size={16}/></button>
                                  <button onClick={() => deleteProduct(p.id)} className="p-3 text-red-300 hover:text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all"><Trash size={16}/></button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                   <div className="flex justify-between items-center bg-white p-8 rounded-[32px] shadow-sm border border-brand-50">
                    <div>
                      <h3 className="text-xl font-heading font-black text-brand-900 tracking-tight">Order Pipeline</h3>
                      <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-1">Monitor fulfillment and status updates</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-[40px] shadow-sm border border-brand-100 overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-brand-50/30 text-brand-400 text-[10px] font-black uppercase tracking-widest">
                          <th className="px-8 py-5">Reference & Time</th>
                          <th className="px-8 py-5">Customer Account</th>
                          <th className="px-8 py-5">Payment Method</th>
                          <th className="px-8 py-5">Order Value</th>
                          <th className="px-8 py-5">Fulfillment Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-50 text-sm">
                        {orders.map((o) => (
                          <tr key={o.id} className="hover:bg-brand-50/20 transition-all group">
                            <td className="px-8 py-6">
                              <p className="font-black text-brand-900 text-xs tracking-tighter">#{o.id.slice(0,8).toUpperCase()}</p>
                              <p className="text-[10px] font-bold text-brand-400 mt-1 uppercase tracking-widest">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                            </td>
                            <td className="px-8 py-6">
                              <p className="font-black text-xs text-brand-900">{o.user?.name}</p>
                              <p className="text-[10px] font-bold text-brand-400 uppercase truncate max-w-[150px]">{o.user?.email}</p>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-[10px] font-black px-2.5 py-1.5 bg-brand-50 text-brand-900 rounded-lg border border-brand-100 uppercase tracking-widest shadow-sm">{o.paymentMethod}</span>
                            </td>
                            <td className="px-8 py-6 font-black text-brand-900 tracking-tighter">₹{Number(o.totalAmount).toLocaleString('en-IN')}</td>
                            <td className="px-8 py-6">
                               <select 
                                 value={o.status} 
                                 onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                 className={`text-[9px] font-black px-4 py-2 rounded-full border-none cursor-pointer uppercase tracking-widest shadow-sm ring-4 ring-transparent focus:ring-brand-500/10 transition-all ${
                                    o.status === 'DELIVERED' ? 'bg-green-500 text-white shadow-green-500/20' :
                                    o.status === 'CANCELLED' ? 'bg-red-500 text-white shadow-red-500/20' :
                                    'bg-brand-900 text-white shadow-brand-900/20'
                                 }`}
                               >
                                 <option value="PENDING">PENDING</option>
                                 <option value="CONFIRMED">CONFIRMED</option>
                                 <option value="PROCESSING">PROCESSING</option>
                                 <option value="SHIPPED">SHIPPED</option>
                                 <option value="DELIVERED">DELIVERED</option>
                                 <option value="CANCELLED">CANCELLED</option>
                               </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'customers' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                   <div className="bg-white p-8 rounded-[32px] shadow-sm border border-brand-50 flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-heading font-black text-brand-900 tracking-tight">Stakeholder Registry</h3>
                        <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-1">Consumer profiles and lifetime value</p>
                      </div>
                   </div>
                  <div className="bg-white rounded-[40px] shadow-sm border border-brand-100 overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                         <tr className="bg-brand-50/30 text-brand-400 text-[10px] font-black uppercase tracking-widest">
                            <th className="px-8 py-5">Profile Information</th>
                            <th className="px-8 py-5">Onboarding Date</th>
                            <th className="px-8 py-5 text-center">Frequency</th>
                            <th className="px-8 py-5 text-right">Lifetime Commitment</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-50 text-sm">
                        {customers.map((c) => (
                          <tr key={c.id} className="hover:bg-brand-50/20 transition-all group">
                            <td className="px-8 py-6 flex items-center gap-5">
                               <div className="w-12 h-12 bg-gradient-to-br from-brand-100 to-brand-200 rounded-[14px] flex items-center justify-center text-brand-800 font-black text-sm shadow-inner ring-2 ring-white group-hover:scale-105 transition-transform">
                                 {c.name[0].toUpperCase()}
                               </div>
                               <div>
                                 <p className="font-black text-brand-900 text-xs tracking-tight">{c.name}</p>
                                 <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-1">{c.email}</p>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-[10px] font-black text-brand-500 uppercase tracking-widest">{new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</td>
                            <td className="px-8 py-6 text-center">
                               <span className="text-[10px] font-black px-3 py-1 rounded-full bg-brand-50 text-brand-700 tracking-tighter">
                                  {c.orders?.length || 0} Orders
                               </span>
                            </td>
                            <td className="px-8 py-6 text-right font-black text-brand-900 tracking-tighter text-base">₹{c.orders?.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0).toLocaleString('en-IN') || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

               {activeTab === 'banners' && (
                 <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex justify-between items-center bg-white p-8 rounded-[32px] shadow-sm border border-brand-50">
                     <div>
                       <h3 className="text-xl font-heading font-black text-brand-900 tracking-tight">Homepage Banners</h3>
                       <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-1">Manage hero carousel content</p>
                     </div>
                     <button 
                       onClick={() => {
                         const title = prompt("Banner Title");
                         const subtitle = prompt("Banner Subtitle");
                         const imageUrl = prompt("Image URL");
                         if (title && imageUrl) {
                           api.post('/banners', { title, subtitle, imageUrl }).then(() => fetchData());
                         }
                       }}
                       className="bg-brand-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-brand-800 transition-all shadow-2xl shadow-brand-900/20 active:scale-95"
                     >
                       <Plus size={18} /> New Banner
                     </button>
                   </div>
 
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {banners.map((b) => (
                       <div key={b.id} className="bg-white rounded-[40px] shadow-sm border border-brand-100 overflow-hidden group">
                          <div className="relative aspect-[21/9] bg-brand-50">
                             <Image src={b.imageUrl} alt={b.title} fill className="object-cover" />
                             <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
                                <h4 className="text-white font-black text-lg tracking-tight">{b.title}</h4>
                                <p className="text-white/80 text-xs font-bold uppercase tracking-widest">{b.subtitle}</p>
                             </div>
                             <button onClick={() => deleteBanner(b.id)} className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={16}/></button>
                          </div>
                          <div className="p-6 flex justify-between items-center bg-white">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-400">Order: {b.order}</span>
                             </div>
                             <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">Active</span>
                          </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

              {activeTab === 'settings' && (
                <div className="flex flex-col items-center justify-center h-[70vh] text-brand-400 bg-white rounded-[50px] border border-dashed border-brand-200 shadow-sm">
                   <div className="w-24 h-24 rounded-[32px] bg-brand-50 flex items-center justify-center mb-8 relative">
                      <Settings size={48} className="text-brand-200 animate-spin-slow" />
                      <div className="absolute inset-0 border-4 border-brand-200 border-dashed rounded-[32px] animate-pulse" />
                   </div>
                  <h4 className="font-heading font-black text-2xl tracking-tighter text-brand-900 mb-2">Core Ecosystem Config</h4>
                  <p className="text-xs font-bold text-brand-400 uppercase tracking-widest">Module under heavy development</p>
                </div>
              )}
            </>
          )}

        </div>
      </main>

    </div>
  );
}
