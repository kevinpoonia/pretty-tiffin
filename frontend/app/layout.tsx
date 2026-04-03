import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'Pretty Tiffin | Premium Customized Tiffin Boxes India',
    template: '%s | Pretty Tiffin'
  },
  description: 'Premium, personalized stainless steel tiffin boxes for gifting and everyday use in India. Discover unique engraved tiffins for birthdays, anniversaries, and corporate gifting.',
  keywords: ['personalized tiffin', 'customized tiffin box', 'stainless steel tiffin India', 'engraved gifts India', 'pretty tiffin'],
  metadataBase: new URL('https://prettytiffin.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Pretty Tiffin | Premium Customized Tiffin Boxes India',
    description: 'Personalized, eco-friendly stainless steel tiffin boxes with premium laser engraving. The perfect gift for your loved ones.',
    url: 'https://prettytiffin.in',
    siteName: 'Pretty Tiffin',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pretty Tiffin Collection',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pretty Tiffin | Premium Customized Tiffin Boxes India',
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
    "name": "Pretty Tiffin",
    "url": "https://prettytiffin.in",
    "logo": "https://prettytiffin.in/logo.png",
    "sameAs": [
      "https://facebook.com/prettytiffin",
      "https://instagram.com/prettytiffin",
      "https://twitter.com/prettytiffin"
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
