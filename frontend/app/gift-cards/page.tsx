import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Gift, Sparkles, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gift Cards | Pretty Luxe Atelier',
  description: 'Give the gift of choice with a Pretty Luxe Atelier gift card. Perfect for birthdays, anniversaries, and every occasion.',
};

const AMOUNTS = [500, 1000, 2000, 5000];

export default function GiftCardsPage() {
  return (
    <div className="bg-[#faf8f4] min-h-screen flex flex-col">
      <Navbar alwaysSolid />
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">

          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} /> Digital Gift Cards
            </div>
            <h1 className="font-heading text-5xl font-bold text-brand-900 mb-4">Give the Gift of Choice</h1>
            <p className="text-brand-500 text-lg max-w-xl mx-auto">
              Let your loved ones pick exactly what they love from our collection. Delivered instantly to their inbox.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {AMOUNTS.map((amount) => (
              <div
                key={amount}
                className="bg-white rounded-3xl p-8 text-center shadow-sm border border-brand-100 hover:shadow-xl hover:border-brand-300 transition-all cursor-pointer group"
              >
                <Gift size={32} className="mx-auto mb-4 text-brand-400 group-hover:text-brand-600 transition-colors" />
                <p className="text-3xl font-heading font-bold text-brand-900">₹{amount.toLocaleString('en-IN')}</p>
                <p className="text-xs text-brand-400 mt-1 font-medium">Gift Card</p>
              </div>
            ))}
          </div>

          <div className="bg-brand-900 rounded-[40px] p-12 text-center text-white">
            <Mail size={40} className="mx-auto mb-6 text-brand-400" />
            <h2 className="font-heading text-3xl font-bold mb-4">Coming Very Soon</h2>
            <p className="text-brand-300 mb-8 max-w-md mx-auto">
              Digital gift cards are launching shortly. In the meantime, reach out to us and we&apos;ll arrange one for you personally.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-white text-brand-900 px-10 py-4 rounded-2xl font-bold text-sm hover:bg-brand-100 transition-colors"
            >
              Contact Us to Order a Gift Card
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
