'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

interface CartItem {
  id?: string;
  productId: string;
  quantity: number;
  customization?: Record<string, any>;
  giftOption?: Record<string, any>;
  price: number;
  name: string;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  sessionId: string | null;
  loading: boolean;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

// Helper to get or create a session ID for guest carts
const getOrCreateSessionId = () => {
  if (typeof window === 'undefined') return null;
  let sid = localStorage.getItem('guest_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('guest_session_id', sid);
  }
  return sid;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const { token } = useAuth(); // If logged in, the auth token is sent automatically via interceptor

  useEffect(() => {
    const sid = getOrCreateSessionId();
    setSessionId(sid);
    fetchCart(sid);
  }, [token]); // Re-fetch cart if auth state changes

  const fetchCart = async (sid: string | null) => {
    try {
      setLoading(true);
      const headers = !token && sid ? { 'x-session-id': sid } : {};
      const res = await api.get('/cart', { headers });
      
      if (res.data) {
        setItems(res.data.items || []);
        calculateTotal(res.data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (cartItems: CartItem[]) => {
    const sum = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(sum);
  };

  const addItem = async (item: CartItem) => {
    try {
      const headers = !token && sessionId ? { 'x-session-id': sessionId } : {};
      const res = await api.post('/cart', item, { headers });
      setItems(res.data.items);
      calculateTotal(res.data.items);
    } catch (error) {
      console.error("Failed to add to cart", error);
      throw error;
    }
  };

  const removeItem = async (id: string) => {
    try {
      const headers = !token && sessionId ? { 'x-session-id': sessionId } : {};
      const res = await api.delete(`/cart/${id}`, { headers });
      setItems(res.data.items || []);
      calculateTotal(res.data.items || []);
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      const headers = !token && sessionId ? { 'x-session-id': sessionId } : {};
      const res = await api.post('/cart', { id, quantity, updateOnly: true }, { headers });
      setItems(res.data.items || []);
      calculateTotal(res.data.items || []);
    } catch (error) {
      console.error("Failed to update cart", error);
    }
  };

  const clearCart = async () => {
    try {
      const headers = !token && sessionId ? { 'x-session-id': sessionId } : {};
      await api.delete('/cart', { headers }); // Assuming backend supports clearing entire cart via DELETE /cart
      setItems([]);
      setTotal(0);
    } catch (error) {
      console.error("Failed to clear cart", error);
    }
  };

  return (
    <CartContext.Provider value={{ items, total, sessionId, loading, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
