'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight, ChevronDown, Loader2, AlertCircle, ShoppingBag, Truck, CheckCircle2, Clock, XCircle, RotateCcw, FileText, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import api from '@/lib/api';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  PROCESSING: 'bg-purple-100 text-purple-700 border-purple-200',
  SHIPPED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_ICON: Record<string, React.ElementType> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  PROCESSING: RotateCcw,
  SHIPPED: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
};

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  customizationDetails?: string;
  product: { name: string; images: string[]; slug: string };
}

interface StatusHistory {
  id: string; status: string; trackingId?: string; note?: string; createdAt: string;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  trackingNumber?: string;
  createdAt: string;
  items: OrderItem[];
  giftOption?: { occasion?: string; message?: string } | null;
  statusHistory?: StatusHistory[];
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const { formatPrice } = useCurrency();
  const Icon = STATUS_ICON[order.status] || Package;
  const date = new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/60 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="bg-brand-50 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
            <Package size={22} className="text-brand-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-mono mb-0.5">#{order.id.slice(0, 8).toUpperCase()}</p>
            <p className="font-semibold text-gray-900 truncate">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
            <p className="text-xs text-gray-500 mt-0.5">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-end shrink-0">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            <Icon size={12} />
            {STATUS_LABEL[order.status] || order.status}
          </span>
          <p className="font-bold text-gray-900 text-sm">{formatPrice(order.totalAmount)}</p>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-5 sm:px-6 py-5 space-y-5">
              <div className="space-y-3">
                {order.items.map((item) => {
                  let customization: Record<string, string> = {};
                  try { customization = JSON.parse(item.customizationDetails || '{}'); } catch {}
                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-brand-50 overflow-hidden relative shrink-0 border border-brand-100">
                        {item.product.images?.[0] ? (
                          <Image src={item.product.images[0]} alt={item.product.name} fill sizes="56px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} className="text-brand-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/shop/${item.product.slug}`} className="font-medium text-gray-900 hover:text-brand-600 transition-colors truncate block text-sm">
                          {item.product.name}
                        </Link>
                        {Object.entries(customization).filter(([, v]) => v).map(([k, v]) => (
                          <p key={k} className="text-xs text-gray-500">{k}: {v}</p>
                        ))}
                        <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} &times; {formatPrice(item.price)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order progress timeline */}
              {(() => {
                const STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
                const STEP_LABELS: Record<string, string> = { PENDING: 'Placed', CONFIRMED: 'Confirmed', PROCESSING: 'Packing', SHIPPED: 'Shipped', DELIVERED: 'Delivered' };
                const currentIdx = STEPS.indexOf(order.status);
                if (order.status === 'CANCELLED') return (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
                    <XCircle size={14} /> Order Cancelled
                  </div>
                );
                return (
                  <div className="space-y-2">
                    <div className="flex gap-0.5">
                      {STEPS.map((s, i) => (
                        <div key={s} className={`flex-1 h-1.5 rounded-full ${i <= currentIdx ? 'bg-brand-500' : 'bg-gray-100'}`} />
                      ))}
                    </div>
                    <div className="flex justify-between">
                      {STEPS.map((s, i) => (
                        <p key={s} className={`text-[9px] font-bold uppercase tracking-wide ${i <= currentIdx ? 'text-brand-600' : 'text-gray-300'}`}>
                          {STEP_LABELS[s]}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Payment</p>
                  <p className="text-gray-700 font-medium">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</p>
                </div>
                {order.trackingNumber && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Tracking</p>
                    <p className="text-gray-700 font-mono font-medium">{order.trackingNumber}</p>
                  </div>
                )}
                {order.giftOption?.occasion && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Gift Occasion</p>
                    <p className="text-gray-700 font-medium">{order.giftOption.occasion}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {order.trackingNumber && (
                  <a
                    href={`https://www.delhivery.com/track/package/${order.trackingNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors"
                  >
                    <Truck size={15} /> Track Order
                  </a>
                )}
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/orders/${order.id}/invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-colors"
                >
                  <FileText size={15} /> View Invoice
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`My order #${order.id.slice(0,8).toUpperCase()} from Pretty Luxe Atelier — Total: ₹${Number(order.totalAmount).toLocaleString('en-IN')} — Status: ${order.status}. View orders: https://prettyluxeatelier.com/account/orders`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors"
                >
                  <MessageCircle size={15} /> Share on WhatsApp
                </a>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Need Help?
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function OrdersPage() {
  const { token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!token) { setLoading(false); return; }
    api.get('/orders/my-orders')
      .then((r) => setOrders(r.data))
      .catch(() => setError('Failed to load orders. Please try again.'))
      .finally(() => setLoading(false));
  }, [token, authLoading]);

  return (
    <div className="bg-[#f5f3ed] min-h-screen flex flex-col">
      <Navbar alwaysSolid />
      <main className="flex-1 pt-28 md:pt-36 lg:pt-44 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-brand-500">Home</Link>
            <ChevronRight size={14} />
            <Link href="/account" className="hover:text-brand-500">Account</Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">My Orders</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8 font-heading">My Orders</h1>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin text-brand-400" />
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && !token && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <p className="text-gray-600 mb-6">Please log in to view your orders.</p>
              <Link href="/login" className="inline-block bg-brand-500 text-white px-10 py-3 rounded-full font-bold hover:bg-brand-600 transition-colors">
                Log In
              </Link>
            </div>
          )}

          {!loading && !error && token && orders.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={32} className="text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                When you place an order, it will appear here. Start shopping our premium tiffin collection!
              </p>
              <Link href="/shop" className="inline-block bg-brand-500 text-white px-10 py-3 rounded-full font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-red-200">
                Explore Shop
              </Link>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => <OrderCard key={order.id} order={order} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
