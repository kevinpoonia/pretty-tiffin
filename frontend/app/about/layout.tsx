import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us – Our Story',
  description: 'Learn how Pretty Luxe Atelier was born from a passion for heritage craftsmanship and meaningful gifting. Premium laser-engraved tiffin boxes made to last a lifetime.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Pretty Luxe Atelier – Our Story',
    description: 'From a passion for heritage craftsmanship to worldwide gifting — discover the story behind Pretty Luxe Atelier.',
    url: 'https://prettyluxeatelier.com/about',
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
