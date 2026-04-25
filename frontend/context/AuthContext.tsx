'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import api, { setApiToken } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, signOut } = useClerkAuth();
  const { user: clerkUser, isLoaded } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    const sync = async () => {
      if (!clerkUser) {
        setUser(null);
        setToken(null);
        setApiToken(null); // clear the getter
        setLoading(false);
        return;
      }
      try {
        const clerkToken = await getToken();
        setToken(clerkToken);
        setApiToken(getToken); // pass the function, not the value
        const res = await api.post('/auth/sync', {}, {
          headers: { Authorization: `Bearer ${clerkToken}` }
        });
        setUser(res.data);
      } catch (err) {
        console.error('Auth sync failed:', err);
      } finally {
        setLoading(false);
      }
    };

    sync();
  }, [isLoaded, clerkUser]);

  const logout = () => signOut({ redirectUrl: '/' });

  const updateUser = (patch: Partial<User>) => {
    setUser((current) => {
      if (!current) return current;
      return { ...current, ...patch };
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
