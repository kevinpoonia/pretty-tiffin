import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Package, Users, BadgePercent, Clock, ShieldCheck, HeadphonesIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bulk & Corporate Orders | Pretty Luxe Atelier',
  description: 'Custom bulk orders for corporates, weddings, and events. Premium laser-engraved tiffin boxes with your logo or message. 20+ units with exclusive pricing.',
};

const PERKS = [
  { icon: BadgePercent, title: 'Exclusive Pricing', desc: 'Significant discounts on orders of 20 units and above.' },
  { icon: Package, title: 'Custom Branding', desc: 'Your logo, message, or design laser-engraved on every piece.' },
  { icon: Clock, title: 'Dedicated Timeline', desc: 'Priority production with committed delivery schedules.' },
  { icon: ShieldCheck, title: 'Quality Guaranteed', desc: 'Every unit inspected before dispatch. Replacements assured.' },
  { icon: Users, title: 'Account Manager', desc: 'A dedicated point of contact for your entire order journey.' },
  { icon: HeadphonesIcon, title: 'Post-Delivery Support', desc: 'We stay connected after delivery to ensure satisfaction.' },
];

export default function BulkOrdersPage() {
  return (
    <div className="bg-[#f5f3ed] min-h-screen flex flex-col">
      <Navbar alwaysSolid />
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">

          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Package size={14} /> Corporate & Bulk
            </div>
            <h1 className="font-heading text-5xl font-bold text-brand-900 mb-4">
              Make Every Gifting Moment<br />Unforgettable at Scale
            </h1>
            <p className="text-brand-500 text-lg max-w-2xl mx-auto">
              From corporate hampers to wedding favours, we craft premium personalized tiffin boxes in bulk — with your branding, your story, your legacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-3xl p-8 shadow-sm border border-brand-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-5">
                  <Icon size={22} className="text-brand-600" />
                </div>
                <h3 className="font-heading font-bold text-brand-900 text-lg mb-2">{title}</h3>
                <p className="text-brand-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-brand-900 rounded-[40px] p-12 md:p-16 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-4xl font-bold text-white mb-4">
                Start with 20+ units.<br />
                <span className="text-brand-400">Get a custom quote.</span>
              </h2>
              <p className="text-brand-300 text-sm leading-relaxed mb-2">
                Fill in your requirements and our team will respond within 24 hours with pricing, timelines, and samples.
              </p>
              <p className="text-brand-400 text-xs">Minimum order: 20 units</p>
            </div>
            <div className="space-y-4">
              <Link
                href="mailto:sales@prettyluxeatelier.com?subject=Bulk Order Enquiry"
                className="block w-full text-center bg-white text-brand-900 px-10 py-4 rounded-2xl font-bold text-sm hover:bg-brand-100 transition-colors"
              >
                Email Us Your Requirements
              </Link>
              <Link
                href="https://wa.me/919999988888?text=Hi%2C%20I%27d%20like%20to%20place%20a%20bulk%20order%20with%20Pretty%20Luxe%20Atelier"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-brand-800 text-white border border-brand-700 px-10 py-4 rounded-2xl font-bold text-sm hover:bg-brand-700 transition-colors"
              >
                WhatsApp Us Directly
              </Link>
              <Link
                href="/contact"
                className="block w-full text-center text-brand-400 text-sm underline underline-offset-4 hover:text-white transition-colors pt-1"
              >
                Use the contact form instead
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
