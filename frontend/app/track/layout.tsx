import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Order',
  description: 'Track the status of your Pretty Luxe Atelier order. Enter your order ID to get real-time delivery updates.',
  alternates: { canonical: '/track' },
  robots: { index: false, follow: false },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
