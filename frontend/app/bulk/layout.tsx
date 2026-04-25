import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bulk & Corporate Gifting Orders',
  description: 'Order 20+ personalized tiffin boxes for corporate gifting, employee appreciation, or special events. Custom logo engraving, branded packaging, and special bulk pricing available.',
  keywords: ['bulk tiffin boxes', 'corporate gifting tiffin', 'custom logo tiffin', 'bulk personalized gifts', 'corporate engraved gifts'],
  alternates: { canonical: '/bulk' },
  openGraph: {
    title: 'Bulk & Corporate Gifting | Pretty Luxe Atelier',
    description: 'Premium personalized tiffin boxes for corporate gifting and bulk orders. Custom logo engraving and branded packaging available.',
    url: 'https://prettyluxeatelier.com/bulk',
  },
};

export default function BulkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
