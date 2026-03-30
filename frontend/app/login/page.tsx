'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      window.location.href = '/account';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen flex flex-col">
      <Navbar alwaysSolid />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        
        <div className="w-full max-w-md bg-white rounded shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Pretty<span className="text-red-500">Tiffin</span>
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {isLogin ? 'Login to access your orders and wishlist.' : 'Create an account to personalize your gifting.'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">{error}</div>}

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required={!isLogin} className="w-full border border-gray-300 px-4 py-2.5 rounded focus:outline-none focus:border-red-500" />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full border border-gray-300 px-4 py-2.5 rounded focus:outline-none focus:border-red-500" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-gray-700 uppercase">Password</label>
                {isLogin && <a href="#" className="text-xs text-red-500 hover:underline">Forgot?</a>}
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="w-full border border-gray-300 px-4 py-2.5 rounded focus:outline-none focus:border-red-500" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-70 text-white font-bold py-3 px-4 rounded transition-colors shadow-sm">
              {loading ? 'PROCESSING...' : (isLogin ? 'SECURE LOGIN' : 'CREATE ACCOUNT')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-red-500 font-bold hover:underline">
              {isLogin ? 'Register' : 'Login'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
