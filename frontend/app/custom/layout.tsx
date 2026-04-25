import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom Engraving & Personalization',
  description: 'Create a truly one-of-a-kind gift. Upload your design, add a personal message, or choose from our engraving templates for a bespoke tiffin box.',
  keywords: ['custom tiffin engraving', 'personalized tiffin design', 'custom logo tiffin', 'bespoke gift engraving'],
  alternates: { canonical: '/custom' },
  openGraph: {
    title: 'Custom Engraving | Pretty Luxe Atelier',
    description: 'Design your own personalized tiffin box with custom engraving, logos, and messages.',
    url: 'https://prettyluxeatelier.com/custom',
  },
};

export default function CustomLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
