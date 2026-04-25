import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'Pretty Luxe Atelier | Premium Customized Tiffin Boxes India',
    template: '%s | Pretty Luxe Atelier'
  },
  description: 'Premium, personalized stainless steel tiffin boxes for gifting and everyday use in India. Discover unique engraved tiffins for birthdays, anniversaries, and corporate gifting.',
  keywords: ['personalized tiffin', 'customized tiffin box', 'stainless steel tiffin India', 'engraved gifts India', 'pretty luxe atelier', 'luxury gifting India'],
  metadataBase: new URL('https://prettyluxeatelier.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Pretty Luxe Atelier | Premium Customized Tiffin Boxes India',
    description: 'Personalized, eco-friendly stainless steel tiffin boxes with premium laser engraving. The perfect gift for your loved ones.',
    url: 'https://prettyluxeatelier.com',
    siteName: 'Pretty Luxe Atelier',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pretty Luxe Atelier Collection',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pretty Luxe Atelier | Premium Customized Tiffin Boxes India',
    description: 'Personalized, eco-friendly stainless steel tiffin boxes with premium laser engraving.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Pretty Luxe Atelier",
    "url": "https://prettyluxeatelier.com",
    "logo": "https://prettyluxeatelier.com/logo.png",
    "sameAs": [
      "https://facebook.com/prettyluxeatelier",
      "https://instagram.com/prettyluxeatelier",
      "https://twitter.com/prettyluxeatelier"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9999988888",
      "contactType": "Customer Service",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi"]
    }
  };

  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col text-[15px] md:text-base">
        <Providers>
          {children}
        </Providers>
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
