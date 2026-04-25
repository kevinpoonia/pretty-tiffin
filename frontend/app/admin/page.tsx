'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LayoutDashboard, ShoppingCart, Users, Package, LogOut, Tag,
  TrendingUp, TrendingDown, DollarSign, Plus, Edit, Trash2, X,
  Loader2, Save, ChevronRight, Bell, Search, ImageIcon, RefreshCw,
  Star, Eye, BarChart3, MessageSquare, CheckCircle, Minus, Image as ImageIconLucide
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ImageUpload from './_components/ImageUpload';
import OrderTimeline from './_components/OrderTimeline';

// ─── Types ───────────────────────────────────────────────────────────────────
type TabType = 'overview' | 'orders' | 'products' | 'customers' | 'banners' | 'coupons';

interface Stats {
  totalUsers: number; totalOrders: number; totalProducts: number;
  revenue: number; monthRevenue: number;
  revenueChange: number; ordersChange: number; usersChange: number;
  avgOrderValue: number;
  revenueByDay: { date: string; amount: number }[];
}

interface Order {
  id: string; status: string; totalAmount: number; paymentMethod: string;
  trackingNumber?: string; createdAt: string; shippingAddress: string;
  user: { name: string; email: string; phone?: string };
  items: { id: string; quantity: number; price: number; product: { name: string; images: string[] } }[];
  statusHistory: { id: string; status: string; trackingId?: string; note?: string; createdAt: string }[];
  giftOption?: { occasion?: string; message?: string } | null;
}

interface Product {
  id: string; name: string; slug: string; description: string;
  price: number; compareAtPrice?: number; images: string[];
  category: string; stock: number; isFeatured: boolean;
  seoTitle?: string; seoDesc?: string;
  customizationOptions: { id: string; type: string; label: string; values: string[]; priceOffset: number }[];
}

interface Customer {
  id: string; name: string; email: string; phone?: string; createdAt: string;
  orders: { id: string; totalAmount: number; status: string; createdAt: string }[];
}

interface Banner { id: string; title: string; subtitle?: string; imageUrl: string; link?: string; isActive: boolean; order: number; }
interface Coupon { id: string; code: string; type: string; value: number; expireAt?: string; usageLimit?: number; usageCount: number; createdAt: string; }

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700', SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700'
};

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function Pill({ status }: { status: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function Trend({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-black ${up ? 'text-green-600' : 'text-red-500'}`}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {Math.abs(value)}% vs last month
    </span>
  );
}

// Mini bar chart
function RevenueChart({ data }: { data: { date: string; amount: number }[] }) {
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <div className="flex items-end gap-1.5 h-16 mt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative flex-1 w-full flex items-end">
            <div
              className="w-full bg-brand-500 rounded-t-lg transition-all group-hover:bg-brand-400"
              style={{ height: `${Math.max((d.amount / max) * 100, 4)}%` }}
            />
          </div>
          <p className="text-[8px] text-brand-400 font-bold whitespace-nowrap">{d.date}</p>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [notify, setNotify] = useState('');

  // Data
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Orders UI
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderTracking, setOrderTracking] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [orderNotify, setOrderNotify] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [orderFilter, setOrderFilter] = useState('');

  // Product UI
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pf, setPf] = useState({
    name: '', slug: '', description: '', price: '', compareAtPrice: '', stock: '', category: '',
    isFeatured: false, seoTitle: '', seoDesc: '', images: [] as string[],
    customizationOptions: [] as { type: string; label: string; values: string; priceOffset: string }[]
  });
  const [savingProduct, setSavingProduct] = useState(false);

  // Customer UI
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Banner UI
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', imageUrl: '', link: '', order: '0' });
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [addingBanner, setAddingBanner] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);

  // Coupon UI
  const [couponForm, setCouponForm] = useState({ code: '', type: 'PERCENTAGE', value: '', expireAt: '', usageLimit: '' });
  const [addingCoupon, setAddingCoupon] = useState(false);

  // ─── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && user && user.role !== 'ADMIN') router.push('/');
  }, [user, authLoading, router]);

  // ─── Data fetching ─────────────────────────────────────────────────────────
  const fetchTab = useCallback(async (t: TabType) => {
    setLoading(true);
    try {
      if (t === 'overview') {
        const [s] = await Promise.all([api.get('/admin/stats')]);
        setStats(s.data);
      } else if (t === 'orders') {
        const res = await api.get('/admin/orders', { params: { status: orderFilter || undefined, limit: 100 } });
        setOrders(res.data.orders || res.data);
        setOrdersTotal(res.data.total || (res.data.orders || res.data).length);
      } else if (t === 'products') {
        const res = await api.get('/admin/products');
        setProducts(res.data);
      } else if (t === 'customers') {
        const res = await api.get('/admin/customers', { params: { search: customerSearch || undefined } });
        setCustomers(res.data);
      } else if (t === 'banners') {
        const res = await api.get('/banners');
        setBanners(res.data);
      } else if (t === 'coupons') {
        const res = await api.get('/admin/coupons');
        setCoupons(res.data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [orderFilter, customerSearch]);

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchTab(tab);
  }, [user, tab, fetchTab]);

  // ─── Order actions ─────────────────────────────────────────────────────────
  const openOrder = (o: Order) => {
    setSelectedOrder(o);
    setOrderStatus(o.status);
    setOrderTracking(o.trackingNumber || '');
    setOrderNote('');
    setOrderNotify(true);
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder) return;
    setUpdatingOrder(true);
    try {
      const res = await api.put(`/admin/orders/${selectedOrder.id}/status`, {
        status: orderStatus,
        trackingId: orderTracking || undefined,
        note: orderNote || undefined,
        notify: orderNotify
      });
      const updated = res.data;
      setSelectedOrder(updated);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      setNotify(orderNotify ? 'Status updated & notifications sent!' : 'Status updated!');
      setTimeout(() => setNotify(''), 4000);
    } catch { setNotify('Failed to update order'); setTimeout(() => setNotify(''), 3000); }
    finally { setUpdatingOrder(false); }
  };

  // ─── Product actions ───────────────────────────────────────────────────────
  const openProductForm = (p?: Product) => {
    setEditingProduct(p || null);
    setPf(p ? {
      name: p.name, slug: p.slug, description: p.description,
      price: String(p.price), compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
      stock: String(p.stock), category: p.category, isFeatured: p.isFeatured,
      seoTitle: p.seoTitle || '', seoDesc: p.seoDesc || '', images: p.images || [],
      customizationOptions: (p.customizationOptions || []).map(o => ({
        type: o.type, label: o.label, values: o.values.join(', '), priceOffset: String(o.priceOffset)
      }))
    } : {
      name: '', slug: '', description: '', price: '', compareAtPrice: '', stock: '', category: '',
      isFeatured: false, seoTitle: '', seoDesc: '', images: [],
      customizationOptions: []
    });
    setProductFormOpen(true);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const payload = {
        ...pf,
        price: Number(pf.price), compareAtPrice: pf.compareAtPrice ? Number(pf.compareAtPrice) : null,
        stock: Number(pf.stock),
        customizationOptions: pf.customizationOptions.map(o => ({
          type: o.type, label: o.label, priceOffset: Number(o.priceOffset) || 0,
          values: o.values.split(',').map(v => v.trim()).filter(Boolean)
        }))
      };
      if (editingProduct) await api.put(`/admin/products/${editingProduct.id}`, payload);
      else await api.post('/admin/products', payload);
      setProductFormOpen(false);
      fetchTab('products');
    } catch (e: any) { alert(e?.response?.data?.error || 'Save failed'); }
    finally { setSavingProduct(false); }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await api.delete(`/admin/products/${id}`);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleFeatured = async (id: string, val: boolean) => {
    await api.patch(`/admin/products/${id}/featured`, { isFeatured: val });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isFeatured: val } : p));
  };

  // ─── Banner actions ────────────────────────────────────────────────────────
  const saveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanner(true);
    try {
      const imageUrl = bannerImages[0] || bannerForm.imageUrl;
      if (!imageUrl) { alert('Add an image first'); return; }
      await api.post('/banners', { ...bannerForm, imageUrl, order: Number(bannerForm.order) });
      setAddingBanner(false);
      setBannerImages([]);
      setBannerForm({ title: '', subtitle: '', imageUrl: '', link: '', order: '0' });
      fetchTab('banners');
    } catch { alert('Failed to save banner'); }
    finally { setSavingBanner(false); }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Remove this banner?')) return;
    await api.delete(`/banners/${id}`);
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  // ─── Coupon actions ────────────────────────────────────────────────────────
  const saveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/coupons', { ...couponForm, value: Number(couponForm.value), usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : undefined });
      setAddingCoupon(false);
      setCouponForm({ code: '', type: 'PERCENTAGE', value: '', expireAt: '', usageLimit: '' });
      fetchTab('coupons');
    } catch (e: any) { alert(e?.response?.data?.error || 'Failed to create coupon'); }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await api.delete(`/admin/coupons/${id}`);
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  // ─── Guard ─────────────────────────────────────────────────────────────────
  if (authLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-50">
        <Loader2 className="animate-spin text-brand-600" size={40} />
      </div>
    );
  }

  const NAV = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'banners', label: 'Banners', icon: ImageIconLucide },
    { id: 'coupons', label: 'Coupons', icon: Tag },
  ] as const;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-brand-50 font-sans overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-brand-900 flex flex-col shrink-0 hidden lg:flex">
        <div className="px-7 py-6 border-b border-brand-800">
          <Link href="/" className="font-heading font-black text-xl text-white">
            PRETTY LUXE<span className="text-brand-400"> ATELIER</span>
          </Link>
          <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mt-1">Admin Console</p>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setTab(id); setSelectedOrder(null); setProductFormOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                tab === id ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'text-brand-400 hover:bg-brand-800 hover:text-white'
              }`}>
              <Icon size={18} /> {label}
              {tab === id && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-brand-800 space-y-1">
          <button onClick={() => api.post('/admin/clear-cache').then(() => { setNotify('Cache cleared!'); setTimeout(() => setNotify(''), 3000); })}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-brand-400 hover:bg-brand-800 hover:text-white text-sm font-bold transition-all">
            <RefreshCw size={16} /> Clear Cache
          </button>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-brand-400 hover:bg-red-900/40 hover:text-red-400 text-sm font-bold transition-all">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-16 bg-white border-b border-brand-100 flex items-center px-8 justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="font-heading font-black text-xl text-brand-900 capitalize">{tab}</h2>
            {tab === 'orders' && <span className="text-xs font-bold text-brand-400 bg-brand-50 px-2.5 py-1 rounded-full">{ordersTotal} orders</span>}
          </div>
          <div className="flex items-center gap-4">
            {notify && (
              <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full animate-in fade-in">
                <CheckCircle size={12} /> {notify}
              </div>
            )}
            <div className="text-right">
              <p className="text-xs font-black text-brand-900">{user.name}</p>
              <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Administrator</p>
            </div>
            <div className="w-9 h-9 bg-brand-900 rounded-xl flex items-center justify-center text-white font-black text-sm">
              {user.name[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="p-8 space-y-8">
              {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-400" size={36} /></div> : stats && (
                <>
                  {/* Stats cards */}
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
                    {[
                      { title: 'Total Revenue', value: `₹${stats.revenue.toLocaleString(undefined)}`, sub: `₹${stats.monthRevenue.toLocaleString(undefined)} this month`, trend: stats.revenueChange, icon: DollarSign, color: 'bg-green-500' },
                      { title: 'Total Orders', value: stats.totalOrders, sub: 'All time orders', trend: stats.ordersChange, icon: ShoppingCart, color: 'bg-blue-500' },
                      { title: 'Avg Order Value', value: `₹${stats.avgOrderValue.toLocaleString(undefined)}`, sub: 'Per order', trend: 0, icon: BarChart3, color: 'bg-purple-500' },
                      { title: 'Customers', value: stats.totalUsers, sub: 'Total accounts', trend: stats.usersChange, icon: Users, color: 'bg-orange-500' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-white`}>
                            <s.icon size={20} />
                          </div>
                          {s.trend !== 0 && <Trend value={s.trend} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">{s.title}</p>
                          <p className="text-2xl font-heading font-black text-brand-900 mt-0.5">{s.value}</p>
                          <p className="text-xs text-brand-400 mt-0.5">{s.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Revenue chart */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-heading font-black text-brand-900">Revenue — Last 7 Days</h3>
                      <p className="text-xs text-brand-400 font-bold">₹{stats.revenueByDay.reduce((s, d) => s + d.amount, 0).toLocaleString(undefined)} total</p>
                    </div>
                    <RevenueChart data={stats.revenueByDay} />
                  </div>

                  {/* Quick actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button onClick={() => { setTab('products'); openProductForm(); }}
                      className="bg-brand-900 text-white rounded-2xl p-5 flex items-center gap-4 hover:bg-brand-800 transition-all group">
                      <div className="w-10 h-10 bg-brand-700 rounded-xl flex items-center justify-center group-hover:bg-brand-600 transition-colors"><Plus size={20} /></div>
                      <div className="text-left"><p className="font-black text-sm">Add Product</p><p className="text-brand-400 text-xs">New listing</p></div>
                    </button>
                    <button onClick={() => setTab('orders')}
                      className="bg-white border border-brand-100 text-brand-900 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all group">
                      <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center"><ShoppingCart size={20} className="text-brand-600" /></div>
                      <div className="text-left"><p className="font-black text-sm">View Orders</p><p className="text-brand-400 text-xs">{stats.totalOrders} total</p></div>
                    </button>
                    <button onClick={() => setTab('coupons')}
                      className="bg-white border border-brand-100 text-brand-900 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all group">
                      <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center"><Tag size={20} className="text-brand-600" /></div>
                      <div className="text-left"><p className="font-black text-sm">Manage Coupons</p><p className="text-brand-400 text-xs">Discounts & offers</p></div>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── ORDERS ── */}
          {tab === 'orders' && (
            <div className="flex h-full overflow-hidden">
              {/* Order list */}
              <div className={`flex flex-col border-r border-brand-100 bg-white ${selectedOrder ? 'w-96 shrink-0' : 'flex-1'}`}>
                {/* Filter bar */}
                <div className="p-4 border-b border-brand-50 flex gap-2 flex-wrap">
                  {['', ...STATUSES].map(s => (
                    <button key={s} onClick={() => { setOrderFilter(s); fetchTab('orders'); }}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                        orderFilter === s ? 'bg-brand-900 text-white' : 'bg-brand-50 text-brand-500 hover:bg-brand-100'
                      }`}>
                      {s || 'All'}
                    </button>
                  ))}
                </div>

                {/* Order rows */}
                <div className="flex-1 overflow-auto divide-y divide-brand-50">
                  {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="animate-spin text-brand-400" size={28} /></div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16 text-brand-400 text-sm font-bold">No orders found</div>
                  ) : orders.map(o => (
                    <button key={o.id} onClick={() => openOrder(o)}
                      className={`w-full text-left px-4 py-4 hover:bg-brand-50 transition-all ${selectedOrder?.id === o.id ? 'bg-brand-50 border-l-2 border-brand-500' : ''}`}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-black text-xs text-brand-900">#{o.id.slice(-8).toUpperCase()}</p>
                        <Pill status={o.status} />
                      </div>
                      <p className="text-xs font-bold text-brand-600 truncate">{o.user?.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-brand-400">{new Date(o.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                        <p className="text-xs font-black text-brand-900">₹{Number(o.totalAmount).toLocaleString(undefined)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order detail panel */}
              {selectedOrder && (
                <div className="flex-1 overflow-auto bg-brand-50/30 p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading font-black text-xl text-brand-900">#{selectedOrder.id.slice(-8).toUpperCase()}</h3>
                      <p className="text-xs text-brand-400 mt-0.5">
                        {new Date(selectedOrder.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-brand-100 rounded-xl transition-colors">
                      <X size={18} className="text-brand-500" />
                    </button>
                  </div>

                  {/* Customer + Amount */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-brand-100">
                      <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-2">Customer</p>
                      <p className="text-sm font-black text-brand-900">{selectedOrder.user?.name}</p>
                      <p className="text-xs text-brand-500">{selectedOrder.user?.email}</p>
                      {selectedOrder.user?.phone && <p className="text-xs text-brand-400">{selectedOrder.user.phone}</p>}
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-brand-100">
                      <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-2">Order Value</p>
                      <p className="text-2xl font-black text-brand-900">₹{Number(selectedOrder.totalAmount).toLocaleString(undefined)}</p>
                      <p className="text-xs text-brand-400">{selectedOrder.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-brand-50 bg-brand-50/50">
                      <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Items ({selectedOrder.items.length})</p>
                    </div>
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-brand-50 last:border-0">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 relative overflow-hidden shrink-0">
                          {item.product.images?.[0]
                            ? <Image src={item.product.images[0]} alt={item.product.name} fill sizes="40px" className="object-cover" />
                            : <Package size={16} className="m-3 text-brand-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-brand-900 truncate">{item.product.name}</p>
                          <p className="text-[10px] text-brand-400">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString(undefined)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status update */}
                  <div className="bg-white rounded-2xl border border-brand-100 p-5 space-y-4">
                    <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Update Order</p>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest block mb-1">Status</label>
                        <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)}
                          className="w-full bg-brand-50 rounded-xl px-3 py-2.5 text-sm font-bold text-brand-900 border-none outline-none focus:ring-2 focus:ring-brand-500/20">
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest block mb-1">Tracking ID</label>
                        <input value={orderTracking} onChange={e => setOrderTracking(e.target.value)}
                          placeholder="e.g. DL1234567890"
                          className="w-full bg-brand-50 rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-brand-900 border-none outline-none focus:ring-2 focus:ring-brand-500/20" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest block mb-1">Note (optional)</label>
                      <input value={orderNote} onChange={e => setOrderNote(e.target.value)}
                        placeholder="Internal note or customer message"
                        className="w-full bg-brand-50 rounded-xl px-3 py-2.5 text-sm text-brand-700 border-none outline-none focus:ring-2 focus:ring-brand-500/20" />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <div onClick={() => setOrderNotify(!orderNotify)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${orderNotify ? 'bg-brand-500' : 'bg-brand-200'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${orderNotify ? 'left-5' : 'left-0.5'}`} />
                      </div>
                      <span className="text-xs font-bold text-brand-700">
                        Send Email + SMS + WhatsApp to customer
                      </span>
                      <Bell size={13} className={orderNotify ? 'text-brand-500' : 'text-brand-300'} />
                    </label>

                    <button onClick={updateOrderStatus} disabled={updatingOrder}
                      className="w-full bg-brand-900 text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-brand-800 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60">
                      {updatingOrder ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      {updatingOrder ? 'Updating…' : 'Update & Notify'}
                    </button>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white rounded-2xl border border-brand-100 p-5">
                    <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-4">Order Progress</p>
                    <OrderTimeline currentStatus={selectedOrder.status} history={selectedOrder.statusHistory || []} />
                  </div>

                  {/* Shipping address */}
                  {selectedOrder.shippingAddress && (() => {
                    try {
                      const addr = JSON.parse(selectedOrder.shippingAddress);
                      return (
                        <div className="bg-white rounded-2xl border border-brand-100 p-4">
                          <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-2">Shipping To</p>
                          <p className="text-xs text-brand-700 leading-relaxed">
                            {addr.street}, {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                        </div>
                      );
                    } catch { return null; }
                  })()}
                </div>
              )}
            </div>
          )}

          {/* ── PRODUCTS ── */}
          {tab === 'products' && (
            <div className="p-6 space-y-6">
              {!productFormOpen && (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-brand-400">{products.length} products in inventory</p>
                  <button onClick={() => openProductForm()}
                    className="flex items-center gap-2 bg-brand-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-800 transition-all shadow-lg shadow-brand-900/20 active:scale-95">
                    <Plus size={16} /> Add Product
                  </button>
                </div>
              )}

              {/* Product form */}
              {productFormOpen && (
                <div className="bg-white rounded-2xl border border-brand-200 shadow-xl p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-black text-xl text-brand-900">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                    <button onClick={() => setProductFormOpen(false)} className="p-2 hover:bg-brand-50 rounded-xl transition-colors"><X size={18} /></button>
                  </div>
                  <form onSubmit={saveProduct} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Product Name', key: 'name', placeholder: 'Premium Heritage Tiffin', required: true },
                        { label: 'URL Slug', key: 'slug', placeholder: 'premium-heritage-tiffin', required: true },
                        { label: 'Price (₹)', key: 'price', placeholder: '1499', required: true, type: 'number' },
                        { label: 'Compare-At Price (₹)', key: 'compareAtPrice', placeholder: '1999 (optional)' },
                        { label: 'Stock', key: 'stock', placeholder: '50', required: true, type: 'number' },
                        { label: 'Category', key: 'category', placeholder: 'Premium Tiffins', required: true },
                        { label: 'SEO Title', key: 'seoTitle', placeholder: 'Optional SEO title' },
                        { label: 'SEO Description', key: 'seoDesc', placeholder: 'Optional SEO description' },
                      ].map(({ label, key, placeholder, required, type }) => (
                        <div key={key} className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-400">{label}</label>
                          <input type={type || 'text'} placeholder={placeholder} required={required}
                            value={(pf as any)[key]}
                            onChange={e => setPf(p => ({ ...p, [key]: e.target.value }))}
                            className="w-full bg-brand-50 rounded-xl px-4 py-2.5 text-sm font-medium text-brand-900 border-none outline-none focus:ring-2 focus:ring-brand-500/20" />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-400">Description</label>
                      <textarea required rows={4} placeholder="Describe your product…"
                        value={pf.description} onChange={e => setPf(p => ({ ...p, description: e.target.value }))}
                        className="w-full bg-brand-50 rounded-xl px-4 py-2.5 text-sm text-brand-700 border-none outline-none focus:ring-2 focus:ring-brand-500/20 resize-none" />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pf.isFeatured} onChange={e => setPf(p => ({ ...p, isFeatured: e.target.checked }))} className="w-4 h-4 rounded accent-brand-600" />
                      <span className="text-sm font-bold text-brand-700">Featured product (shown on homepage)</span>
                    </label>

                    {/* Image upload */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-400">Product Images</label>
                      <ImageUpload images={pf.images} onChange={imgs => setPf(p => ({ ...p, images: imgs }))} />
                    </div>

                    {/* Customization options */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-400">Customization Options</label>
                        <button type="button"
                          onClick={() => setPf(p => ({ ...p, customizationOptions: [...p.customizationOptions, { type: 'ENGRAVING', label: '', values: '', priceOffset: '0' }] }))}
                          className="flex items-center gap-1 text-xs font-black text-brand-600 hover:text-brand-900 bg-brand-50 px-3 py-1.5 rounded-lg transition-colors">
                          <Plus size={12} /> Add Option
                        </button>
                      </div>
                      {pf.customizationOptions.map((opt, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-3 bg-brand-50/50 p-4 rounded-xl border border-brand-100 relative">
                          <button type="button" onClick={() => setPf(p => ({ ...p, customizationOptions: p.customizationOptions.filter((_, i) => i !== idx) }))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-brand-200 rounded-full flex items-center justify-center text-brand-400 hover:text-red-500 shadow-sm">
                            <X size={11} />
                          </button>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-brand-400">Type</label>
                            <select value={opt.type} onChange={e => setPf(p => { const o = [...p.customizationOptions]; o[idx].type = e.target.value; return { ...p, customizationOptions: o }; })}
                              className="w-full bg-white border border-brand-100 rounded-lg px-2 py-2 text-xs font-bold text-brand-900 outline-none">
                              {['ENGRAVING', 'TEXT', 'COLOR', 'PACKAGING'].map(t => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-brand-400">Label</label>
                            <input value={opt.label} onChange={e => setPf(p => { const o = [...p.customizationOptions]; o[idx].label = e.target.value; return { ...p, customizationOptions: o }; })}
                              placeholder="Engraving Text" className="w-full bg-white border border-brand-100 rounded-lg px-2 py-2 text-xs font-bold text-brand-900 outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-brand-400">Values (CSV)</label>
                            <input value={opt.values} onChange={e => setPf(p => { const o = [...p.customizationOptions]; o[idx].values = e.target.value; return { ...p, customizationOptions: o }; })}
                              placeholder="Gold, Silver" className="w-full bg-white border border-brand-100 rounded-lg px-2 py-2 text-xs font-bold text-brand-900 outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-brand-400">+Price (₹)</label>
                            <input type="number" value={opt.priceOffset} onChange={e => setPf(p => { const o = [...p.customizationOptions]; o[idx].priceOffset = e.target.value; return { ...p, customizationOptions: o }; })}
                              placeholder="0" className="w-full bg-white border border-brand-100 rounded-lg px-2 py-2 text-xs font-bold text-brand-900 outline-none" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 justify-end pt-2 border-t border-brand-100">
                      <button type="button" onClick={() => setProductFormOpen(false)} className="px-6 py-2.5 text-xs font-black text-brand-500 hover:bg-brand-50 rounded-xl transition-colors uppercase tracking-widest">Cancel</button>
                      <button type="submit" disabled={savingProduct}
                        className="flex items-center gap-2 px-8 py-2.5 bg-brand-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-800 shadow-lg active:scale-95 disabled:opacity-60">
                        {savingProduct ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {savingProduct ? 'Saving…' : 'Save Product'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Product grid */}
              {!productFormOpen && (
                <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden shadow-sm">
                  {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="animate-spin text-brand-400" size={28} /></div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-16">
                      <Package size={40} className="mx-auto mb-4 text-brand-200" />
                      <p className="text-sm font-bold text-brand-400">No products yet. Add your first one!</p>
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-brand-50/50 text-brand-400 text-[10px] font-black uppercase tracking-widest border-b border-brand-100">
                          <th className="px-6 py-4">Product</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Price</th>
                          <th className="px-6 py-4 text-center">Stock</th>
                          <th className="px-6 py-4 text-center">Featured</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-50">
                        {products.map(p => (
                          <tr key={p.id} className="hover:bg-brand-50/30 group transition-colors">
                            <td className="px-6 py-4 flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-brand-50 relative overflow-hidden shrink-0 border border-brand-100">
                                {p.images?.[0]
                                  ? <Image src={p.images[0]} alt={p.name} fill sizes="48px" className="object-cover" />
                                  : <ImageIcon size={20} className="m-3 text-brand-300" />}
                              </div>
                              <div>
                                <p className="text-sm font-black text-brand-900 truncate max-w-[180px]">{p.name}</p>
                                <p className="text-[10px] text-brand-400 font-mono">/{p.slug}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-500">{p.category}</td>
                            <td className="px-6 py-4">
                              <p className="font-black text-brand-900 text-sm">₹{Number(p.price).toLocaleString(undefined)}</p>
                              {p.compareAtPrice && <p className="text-[10px] text-brand-400 line-through">₹{Number(p.compareAtPrice).toLocaleString(undefined)}</p>}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                {p.stock}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button onClick={() => toggleFeatured(p.id, !p.isFeatured)}>
                                <Star size={16} className={p.isFeatured ? 'text-yellow-400 fill-yellow-400' : 'text-brand-200'} />
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={`/shop/${p.slug}`} target="_blank"
                                  className="p-2 text-brand-400 hover:text-brand-900 bg-brand-50 rounded-lg hover:bg-brand-100 transition-all">
                                  <Eye size={15} />
                                </Link>
                                <button onClick={() => openProductForm(p)}
                                  className="p-2 text-brand-400 hover:text-brand-900 bg-brand-50 rounded-lg hover:bg-brand-100 transition-all">
                                  <Edit size={15} />
                                </button>
                                <button onClick={() => deleteProduct(p.id)}
                                  className="p-2 text-brand-300 hover:text-red-600 bg-brand-50 rounded-lg hover:bg-red-50 transition-all">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── CUSTOMERS ── */}
          {tab === 'customers' && (
            <div className="flex h-full overflow-hidden">
              <div className={`flex flex-col bg-white border-r border-brand-100 ${selectedCustomer ? 'w-96 shrink-0' : 'flex-1'}`}>
                <div className="p-4 border-b border-brand-50">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
                    <input value={customerSearch} onChange={e => { setCustomerSearch(e.target.value); fetchTab('customers'); }}
                      placeholder="Search by name or email…"
                      className="w-full bg-brand-50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-brand-700 border-none outline-none focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                </div>
                <div className="flex-1 overflow-auto divide-y divide-brand-50">
                  {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="animate-spin text-brand-400" size={28} /></div>
                  ) : customers.map(c => (
                    <button key={c.id} onClick={() => setSelectedCustomer(c)}
                      className={`w-full text-left px-4 py-4 hover:bg-brand-50 transition-all ${selectedCustomer?.id === c.id ? 'bg-brand-50 border-l-2 border-brand-500' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center font-black text-brand-700 text-sm shrink-0">
                          {c.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-brand-900 truncate">{c.name}</p>
                          <p className="text-[10px] text-brand-400 truncate">{c.email}</p>
                        </div>
                        <span className="ml-auto text-[10px] font-black text-brand-400 shrink-0">{c.orders.length} orders</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedCustomer && (
                <div className="flex-1 overflow-auto p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-brand-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                        {selectedCustomer.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-xl text-brand-900">{selectedCustomer.name}</h3>
                        <p className="text-sm text-brand-400">{selectedCustomer.email}</p>
                        {selectedCustomer.phone && <p className="text-xs text-brand-400">{selectedCustomer.phone}</p>}
                      </div>
                    </div>
                    <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-brand-100 rounded-xl"><X size={18} /></button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-brand-100 text-center">
                      <p className="text-2xl font-black text-brand-900">{selectedCustomer.orders.length}</p>
                      <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Orders</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-brand-100 text-center">
                      <p className="text-2xl font-black text-brand-900">
                        ₹{selectedCustomer.orders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + Number(o.totalAmount), 0).toLocaleString(undefined)}
                      </p>
                      <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Lifetime Value</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-brand-100 text-center">
                      <p className="text-2xl font-black text-brand-900">
                        {new Date(selectedCustomer.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Member Since</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden">
                    <div className="px-4 py-3 bg-brand-50/50 border-b border-brand-50">
                      <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Order History</p>
                    </div>
                    {selectedCustomer.orders.length === 0
                      ? <p className="text-center text-sm text-brand-400 py-8">No orders yet</p>
                      : selectedCustomer.orders.map(o => (
                        <div key={o.id} className="flex items-center justify-between px-4 py-3 border-b border-brand-50 last:border-0">
                          <div>
                            <p className="text-xs font-black text-brand-900">#{o.id.slice(-8).toUpperCase()}</p>
                            <p className="text-[10px] text-brand-400">{new Date(o.createdAt).toLocaleDateString(undefined)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Pill status={o.status} />
                            <p className="text-sm font-black text-brand-900">₹{Number(o.totalAmount).toLocaleString(undefined)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── BANNERS ── */}
          {tab === 'banners' && (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-brand-400">{banners.length} banners</p>
                <button onClick={() => setAddingBanner(!addingBanner)}
                  className="flex items-center gap-2 bg-brand-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-800 transition-all shadow-lg active:scale-95">
                  {addingBanner ? <X size={16} /> : <Plus size={16} />}
                  {addingBanner ? 'Cancel' : 'New Banner'}
                </button>
              </div>

              {addingBanner && (
                <div className="bg-white rounded-2xl border border-brand-200 p-6 space-y-5 shadow-xl">
                  <h3 className="font-heading font-black text-xl text-brand-900">Add Banner</h3>
                  <form onSubmit={saveBanner} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-400">Banner Image</label>
                      <ImageUpload images={bannerImages} onChange={setBannerImages} maxImages={1} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Title', key: 'title', required: true },
                        { label: 'Subtitle', key: 'subtitle' },
                        { label: 'Link URL', key: 'link' },
                        { label: 'Display Order', key: 'order' },
                      ].map(({ label, key, required }) => (
                        <div key={key} className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-400">{label}</label>
                          <input required={required} placeholder={label} value={(bannerForm as any)[key]}
                            onChange={e => setBannerForm(f => ({ ...f, [key]: e.target.value }))}
                            className="w-full bg-brand-50 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-900 border-none outline-none focus:ring-2 focus:ring-brand-500/20" />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <button type="button" onClick={() => setAddingBanner(false)} className="px-6 py-2.5 text-xs font-black text-brand-500 hover:bg-brand-50 rounded-xl transition-colors uppercase tracking-widest">Cancel</button>
                      <button type="submit" disabled={savingBanner}
                        className="flex items-center gap-2 px-8 py-2.5 bg-brand-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-800 active:scale-95 disabled:opacity-60">
                        {savingBanner ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save Banner
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? <div className="col-span-2 flex justify-center py-16"><Loader2 className="animate-spin text-brand-400" size={28} /></div>
                  : banners.map(b => (
                    <div key={b.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-100 group">
                      <div className="relative aspect-[21/9] bg-brand-50">
                        <Image src={b.imageUrl} alt={b.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end">
                          <h4 className="text-white font-black text-sm">{b.title}</h4>
                          {b.subtitle && <p className="text-white/70 text-xs">{b.subtitle}</p>}
                        </div>
                        <button onClick={() => deleteBanner(b.id)}
                          className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl shadow opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="px-4 py-3 flex items-center justify-between">
                        <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Order #{b.order}</span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {b.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ── COUPONS ── */}
          {tab === 'coupons' && (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-brand-400">{coupons.length} coupons active</p>
                <button onClick={() => setAddingCoupon(!addingCoupon)}
                  className="flex items-center gap-2 bg-brand-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-800 transition-all shadow-lg active:scale-95">
                  {addingCoupon ? <X size={16} /> : <Plus size={16} />}
                  {addingCoupon ? 'Cancel' : 'New Coupon'}
                </button>
              </div>

              {addingCoupon && (
                <div className="bg-white rounded-2xl border border-brand-200 p-6 shadow-xl space-y-5">
                  <h3 className="font-heading font-black text-xl text-brand-900">Create Coupon</h3>
                  <form onSubmit={saveCoupon} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-400">Coupon Code</label>
                        <input required placeholder="SAVE20" value={couponForm.code}
                          onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                          className="w-full bg-brand-50 rounded-xl px-4 py-2.5 text-sm font-mono font-black text-brand-900 border-none outline-none focus:ring-2 focus:ring-brand-500/20" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-400">Type</label>
                        <select value={couponForm.type} onChange={e => setCouponForm(f => ({ ...f, type: e.target.value }))}
                          className="w-full bg-brand-50 rounded-xl px-3 py-2.5 text-sm font-bold text-brand-900 border-none outline-none focus:ring-2 focus:ring-brand-500/20">
                          <option value="PERCENTAGE">Percentage (%)</option>
                          <option value="FLAT">Flat (₹)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-400">Value</label>
                        <input required type="number" placeholder={couponForm.type === 'PERCENTAGE' ? '20 (= 20%)' : '200 (= ₹200 off)'}
                          value={couponForm.value} onChange={e => setCouponForm(f => ({ ...f, value: e.target.value }))}
                          className="w-full bg-brand-50 rounded-xl px-4 py-2.5 text-sm font-black text-brand-900 border-none outline-none focus:ring-2 focus:ring-brand-500/20" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-400">Usage Limit</label>
                        <input type="number" placeholder="Unlimited" value={couponForm.usageLimit}
                          onChange={e => setCouponForm(f => ({ ...f, usageLimit: e.target.value }))}
                          className="w-full bg-brand-50 rounded-xl px-4 py-2.5 text-sm font-bold text-brand-900 border-none outline-none focus:ring-2 focus:ring-brand-500/20" />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-400">Expiry Date (optional)</label>
                        <input type="datetime-local" value={couponForm.expireAt}
                          onChange={e => setCouponForm(f => ({ ...f, expireAt: e.target.value }))}
                          className="w-full bg-brand-50 rounded-xl px-4 py-2.5 text-sm font-bold text-brand-900 border-none outline-none focus:ring-2 focus:ring-brand-500/20" />
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <button type="button" onClick={() => setAddingCoupon(false)} className="px-6 py-2.5 text-xs font-black text-brand-500 hover:bg-brand-50 rounded-xl transition-colors uppercase tracking-widest">Cancel</button>
                      <button type="submit" className="flex items-center gap-2 px-8 py-2.5 bg-brand-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-800 active:scale-95">
                        <Save size={14} /> Create Coupon
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden shadow-sm">
                {loading ? (
                  <div className="flex justify-center py-16"><Loader2 className="animate-spin text-brand-400" size={28} /></div>
                ) : coupons.length === 0 ? (
                  <div className="text-center py-16">
                    <Tag size={36} className="mx-auto mb-4 text-brand-200" />
                    <p className="text-sm font-bold text-brand-400">No coupons yet</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-brand-50/50 text-brand-400 text-[10px] font-black uppercase tracking-widest border-b border-brand-100">
                        <th className="px-6 py-4">Code</th>
                        <th className="px-6 py-4">Discount</th>
                        <th className="px-6 py-4">Usage</th>
                        <th className="px-6 py-4">Expires</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-50">
                      {coupons.map(c => {
                        const expired = c.expireAt && new Date(c.expireAt) < new Date();
                        const maxed = c.usageLimit && c.usageCount >= c.usageLimit;
                        return (
                          <tr key={c.id} className={`group hover:bg-brand-50/30 transition-colors ${expired || maxed ? 'opacity-50' : ''}`}>
                            <td className="px-6 py-4">
                              <span className="font-mono font-black text-brand-900 text-sm tracking-widest bg-brand-50 px-3 py-1 rounded-lg">{c.code}</span>
                            </td>
                            <td className="px-6 py-4 font-black text-brand-900">
                              {c.type === 'PERCENTAGE' ? `${c.value}% off` : `₹${c.value} off`}
                            </td>
                            <td className="px-6 py-4 text-sm text-brand-500">
                              {c.usageCount} used {c.usageLimit ? `/ ${c.usageLimit}` : '(unlimited)'}
                            </td>
                            <td className="px-6 py-4 text-sm text-brand-400">
                              {c.expireAt ? new Date(c.expireAt).toLocaleDateString(undefined) : '—'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => deleteCoupon(c.id)}
                                className="p-2 text-brand-300 hover:text-red-600 bg-brand-50 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
