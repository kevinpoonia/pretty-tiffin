import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Pretty Luxe Atelier. We reply within 24 hours. Reach us by email, WhatsApp, or send a message directly — we\'d love to help with your gifting needs.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Pretty Luxe Atelier',
    description: 'Questions about personalized tiffins, bulk orders, or corporate gifting? We\'re here to help.',
    url: 'https://prettyluxeatelier.com/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
