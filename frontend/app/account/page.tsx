'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  ArrowRight,
  Heart,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Plus,
  Settings,
  ShieldCheck,
  X
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

type AccountTab = 'orders' | 'addresses' | 'wishlist' | 'settings';

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number | string;
  items?: Array<{
    id: string;
    quantity: number;
    product?: {
      name?: string;
      slug?: string;
    };
  }>;
}

const emptyAddressForm = {
  street: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  isDefault: false
};

export default function AccountDashboard() {
  const [activeTab, setActiveTab] = useState<AccountTab>('orders');
  const { user, loading: authLoading, logout, updateUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [addressMessage, setAddressMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user?.id) return;
    loadOrders();
    loadAddresses();
    loadProfile();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
  }, [user?.name, user?.email, user?.phone]);

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await api.get('/orders/my-orders');
      setOrders(res.data || []);
    } catch (error) {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      setAddressesLoading(true);
      const res = await api.get('/users/addresses');
      setAddresses(res.data || []);
    } catch (error) {
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await api.get('/users/profile');
      const profile = res.data;
      setProfileForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || ''
      });
      updateUser({
        name: profile.name,
        email: profile.email,
        phone: profile.phone
      });
    } catch (error) {
      setProfileMessage({ type: 'error', text: 'Unable to load your latest account details.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const openAddressForm = (address?: Address) => {
    setAddressMessage(null);

    if (address) {
      setEditingAddressId(address.id);
      setAddressForm({
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country || 'India',
        isDefault: address.isDefault
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        ...emptyAddressForm,
        isDefault: addresses.length === 0
      });
    }

    setAddressFormOpen(true);
  };

  const closeAddressForm = () => {
    setAddressFormOpen(false);
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
  };

  const handleProfileSave = async () => {
    try {
      setProfileSaving(true);
      setProfileMessage(null);
      const res = await api.put('/users/profile', profileForm);
      updateUser({
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone
      });
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error: any) {
      setProfileMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordMessage(null);
      await api.put('/users/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAddressSave = async () => {
    try {
      setAddressSaving(true);
      setAddressMessage(null);

      if (editingAddressId) {
        await api.put(`/users/addresses/${editingAddressId}`, addressForm);
      } else {
        await api.post('/users/addresses', addressForm);
      }

      await loadAddresses();
      closeAddressForm();
      setAddressMessage({
        type: 'success',
        text: editingAddressId ? 'Address updated successfully.' : 'Address added successfully.'
      });
    } catch (error: any) {
      setAddressMessage({ type: 'error', text: error.response?.data?.error || 'Failed to save address.' });
    } finally {
      setAddressSaving(false);
    }
  };

  const handleAddressDelete = async (addressId: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Remove this address from your account?')) {
      return;
    }

    try {
      setAddressMessage(null);
      await api.delete(`/users/addresses/${addressId}`);
      await loadAddresses();
      setAddressMessage({ type: 'success', text: 'Address removed successfully.' });
    } catch (error: any) {
      setAddressMessage({ type: 'error', text: error.response?.data?.error || 'Failed to remove address.' });
    }
  };

  const initials = user?.name.split(' ').map((namePart: string) => namePart[0]).join('').toUpperCase().slice(0, 2) || 'PT';

  if (authLoading || !user) {
    return (
      <div className="bg-[#faf8f4] min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  return (
    <>
      <Navbar alwaysSolid />
      <main className="flex-1 bg-brand-50 pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-100 lg:sticky lg:top-28">
                <div className="mb-8 text-center">
                  <div className="w-20 h-20 bg-brand-200 rounded-full mx-auto flex items-center justify-center text-brand-700 font-heading font-bold text-2xl mb-3">
                    {initials}
                  </div>
                  <h2 className="font-heading font-bold text-brand-900">{user.name}</h2>
                  <p className="text-sm text-brand-600">{user.email}</p>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="mt-2 inline-block text-xs bg-brand-100 text-brand-600 font-bold px-2 py-1 rounded">
                      ADMIN PANEL
                    </Link>
                  )}
                </div>

                <nav className="space-y-2">
                  {[
                    { id: 'orders', label: 'My Orders', icon: Package },
                    { id: 'addresses', label: 'Addresses', icon: MapPin },
                    { id: 'wishlist', label: 'Wishlist', icon: Heart },
                    { id: 'settings', label: 'Settings', icon: Settings }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as AccountTab)}
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
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-brand-500 hover:bg-brand-50 transition-colors">
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                </nav>
              </div>
            </aside>

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
                      <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-brand-500" size={28} />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="bg-white rounded-3xl p-12 text-center border border-brand-100">
                        <Package size={40} className="mx-auto mb-4 text-brand-300" />
                        <h3 className="font-bold text-brand-700 mb-2">No orders yet</h3>
                        <p className="text-sm text-brand-500 mb-6">Start shopping and your orders will appear here.</p>
                        <Link href="/shop" className="bg-brand-500 text-white px-6 py-2 rounded font-semibold text-sm hover:bg-brand-600">
                          Shop Now
                        </Link>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-brand-100">
                          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-brand-100 pb-4 mb-4 gap-4">
                            <div>
                              <p className="text-xs text-brand-500 font-semibold mb-1 uppercase tracking-wider">
                                Order #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                              <p className="text-sm text-brand-700">
                                Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider ${
                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                order.status === 'CANCELLED' ? 'bg-brand-100 text-brand-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {order.status}
                              </span>
                              <p className="font-bold text-brand-900">₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                          <div className="flex gap-4 items-center">
                            <div className="flex-1 space-y-1">
                              {order.items?.map((item) => (
                                <p key={item.id} className="text-sm text-brand-700">
                                  {item.product?.name || 'Product'} × {item.quantity}
                                </p>
                              ))}
                            </div>
                            <Link href="/shop" className="hidden md:flex items-center gap-2 text-sm font-medium text-brand-600 border border-brand-200 px-4 py-2 rounded-lg hover:bg-brand-50">
                              Reorder <ArrowRight size={16} />
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <h2 className="text-2xl font-bold font-heading text-brand-900">Saved Addresses</h2>
                      <button
                        onClick={() => openAddressForm()}
                        className="bg-brand-900 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-brand-800 transition-colors inline-flex items-center gap-2"
                      >
                        <Plus size={16} /> Add New
                      </button>
                    </div>

                    {addressMessage && (
                      <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${addressMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-brand-50 text-brand-600 border border-brand-200'}`}>
                        {addressMessage.text}
                      </div>
                    )}

                    {addressFormOpen && (
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-100 space-y-5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="font-heading font-bold text-xl text-brand-900">
                              {editingAddressId ? 'Edit Address' : 'Add New Address'}
                            </h3>
                            <p className="text-sm text-brand-500">Save delivery details for faster checkout.</p>
                          </div>
                          <button onClick={closeAddressForm} className="w-10 h-10 rounded-full border border-brand-200 flex items-center justify-center text-brand-500 hover:text-brand-900">
                            <X size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Street Address"
                            value={addressForm.street}
                            onChange={(e) => setAddressForm((current) => ({ ...current, street: e.target.value }))}
                            className="border border-brand-200 px-4 py-3 rounded-2xl bg-brand-50 focus:outline-none focus:border-brand-500"
                          />
                          <input
                            type="text"
                            placeholder="City"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm((current) => ({ ...current, city: e.target.value }))}
                            className="border border-brand-200 px-4 py-3 rounded-2xl bg-brand-50 focus:outline-none focus:border-brand-500"
                          />
                          <input
                            type="text"
                            placeholder="State"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm((current) => ({ ...current, state: e.target.value }))}
                            className="border border-brand-200 px-4 py-3 rounded-2xl bg-brand-50 focus:outline-none focus:border-brand-500"
                          />
                          <input
                            type="text"
                            placeholder="PIN Code"
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm((current) => ({ ...current, pincode: e.target.value }))}
                            className="border border-brand-200 px-4 py-3 rounded-2xl bg-brand-50 focus:outline-none focus:border-brand-500"
                          />
                          <input
                            type="text"
                            placeholder="Country"
                            value={addressForm.country}
                            onChange={(e) => setAddressForm((current) => ({ ...current, country: e.target.value }))}
                            className="border border-brand-200 px-4 py-3 rounded-2xl bg-brand-50 focus:outline-none focus:border-brand-500 md:col-span-2"
                          />
                        </div>

                        <label className="flex items-center gap-3 text-sm text-brand-700 font-medium">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm((current) => ({ ...current, isDefault: e.target.checked }))}
                            className="rounded border-brand-300 text-brand-500 focus:ring-brand-500"
                          />
                          Make this my default address
                        </label>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={handleAddressSave}
                            disabled={addressSaving}
                            className="bg-brand-900 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-brand-800 transition-colors disabled:opacity-70"
                          >
                            {addressSaving ? 'Saving Address...' : editingAddressId ? 'Update Address' : 'Save Address'}
                          </button>
                          <button
                            onClick={closeAddressForm}
                            className="border border-brand-200 text-brand-700 px-5 py-3 rounded-2xl font-semibold hover:bg-brand-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {addressesLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-brand-500" size={28} />
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="bg-white rounded-3xl p-12 text-center border border-brand-100">
                        <MapPin size={40} className="mx-auto mb-4 text-brand-300" />
                        <h3 className="font-bold text-brand-700 mb-2">No addresses saved</h3>
                        <p className="text-sm text-brand-500 mb-6">Add an address to speed up your checkout process.</p>
                        <button
                          onClick={() => openAddressForm()}
                          className="bg-brand-500 text-white px-6 py-2 rounded font-semibold text-sm hover:bg-brand-600"
                        >
                          Add Address
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((address) => (
                          <div key={address.id} className={`bg-white rounded-3xl p-6 shadow-sm border ${address.isDefault ? 'border-brand-500 bg-brand-50/10' : 'border-brand-100'} relative`}>
                            {address.isDefault && (
                              <div className="absolute top-4 right-4 bg-brand-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-sm">
                                DEFAULT
                              </div>
                            )}
                            <h4 className="font-heading font-black text-brand-900 mb-2">{address.isDefault ? 'Default Address' : 'Saved Address'}</h4>
                            <p className="text-sm text-brand-700 mb-1 font-bold">{profileForm.name || user.name}</p>
                            <p className="text-sm text-brand-600 leading-relaxed mb-4">
                              {address.street}<br />
                              {address.city}, {address.state}<br />
                              {address.country} {address.pincode}
                            </p>
                            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest pt-2 border-t border-brand-50 mt-2">
                              <button onClick={() => openAddressForm(address)} className="text-brand-500 hover:text-brand-900 transition-colors">
                                Edit
                              </button>
                              <button onClick={() => handleAddressDelete(address.id)} className="text-brand-400 hover:text-brand-600 transition-colors">
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'wishlist' && (
                  <div className="bg-white rounded-3xl p-12 border border-brand-100 text-center">
                    <Heart size={40} className="mx-auto mb-4 text-brand-300" />
                    <h2 className="text-2xl font-bold font-heading text-brand-900 mb-2">Your Wishlist</h2>
                    <p className="text-sm text-brand-500 mb-6">
                      Keep your favorite tiffins in one place and come back to them anytime.
                    </p>
                    <Link href="/wishlist" className="inline-flex items-center gap-2 bg-brand-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-brand-800 transition-colors">
                      Open Wishlist <ArrowRight size={16} />
                    </Link>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-100">
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div>
                          <h2 className="text-2xl font-bold font-heading text-brand-900">Profile Settings</h2>
                          <p className="text-sm text-brand-500">Update your personal details for orders and account communication.</p>
                        </div>
                        {profileLoading && <Loader2 className="animate-spin text-brand-500" size={20} />}
                      </div>

                      {profileMessage && (
                        <div className={`rounded-2xl px-4 py-3 text-sm font-medium mb-5 ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-brand-50 text-brand-600 border border-brand-200'}`}>
                          {profileMessage.text}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm((current) => ({ ...current, name: e.target.value }))}
                          className="border border-brand-200 px-4 py-3 rounded-2xl bg-brand-50 focus:outline-none focus:border-brand-500"
                        />
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm((current) => ({ ...current, email: e.target.value }))}
                          className="border border-brand-200 px-4 py-3 rounded-2xl bg-brand-50 focus:outline-none focus:border-brand-500"
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm((current) => ({ ...current, phone: e.target.value }))}
                          className="border border-brand-200 px-4 py-3 rounded-2xl bg-brand-50 focus:outline-none focus:border-brand-500 md:col-span-2"
                        />
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={handleProfileSave}
                          disabled={profileSaving}
                          className="bg-brand-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-brand-800 transition-colors disabled:opacity-70"
                        >
                          {profileSaving ? 'Saving Changes...' : 'Save Profile'}
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-100">
                      <div className="flex items-start gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700">
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold font-heading text-brand-900">Security</h3>
                          <p className="text-sm text-brand-500">Change your password to keep your account secure.</p>
                        </div>
                      </div>

                      {passwordMessage && (
                        <div className={`rounded-2xl px-4 py-3 text-sm font-medium mb-5 ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-brand-50 text-brand-600 border border-brand-200'}`}>
                          {passwordMessage.text}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="password"
                          placeholder="Current Password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm((current) => ({ ...current, currentPassword: e.target.value }))}
                          className="border border-brand-200 px-4 py-3 rounded-2xl bg-brand-50 focus:outline-none focus:border-brand-500"
                        />
                        <input
                          type="password"
                          placeholder="New Password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm((current) => ({ ...current, newPassword: e.target.value }))}
                          className="border border-brand-200 px-4 py-3 rounded-2xl bg-brand-50 focus:outline-none focus:border-brand-500"
                        />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm((current) => ({ ...current, confirmPassword: e.target.value }))}
                          className="border border-brand-200 px-4 py-3 rounded-2xl bg-brand-50 focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={handlePasswordSave}
                          disabled={passwordSaving}
                          className="bg-brand-500 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-brand-600 transition-colors disabled:opacity-70"
                        >
                          {passwordSaving ? 'Updating Password...' : 'Update Password'}
                        </button>
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
