import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Returns Policy',
  description: 'Learn about Pretty Luxe Atelier\'s worldwide shipping policy, delivery timeframes, return process, and how we handle custom engraved orders.',
  alternates: { canonical: '/shipping' },
  openGraph: {
    title: 'Shipping & Returns | Pretty Luxe Atelier',
    description: 'Worldwide shipping included on all orders. Standard delivery 7–14 business days, express 3–7 days. Easy returns policy.',
    url: 'https://prettyluxeatelier.com/shipping',
  },
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
