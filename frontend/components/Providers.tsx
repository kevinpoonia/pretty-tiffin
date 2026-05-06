'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';
import { CurrencyProvider } from '../context/CurrencyContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('guest_session_id')) {
      const sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guest_session_id', sid);
    }
  }, []);

  return (
    <ClerkProvider signInUrl="/login" signUpUrl="/login">
      <ToastProvider>
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ToastProvider>
    </ClerkProvider>
  );
}
