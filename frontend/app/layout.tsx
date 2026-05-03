import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'Pretty Luxe Atelier | Premium Personalized Tiffin Boxes & Gifts',
    template: '%s | Pretty Luxe Atelier'
  },
  description: 'Premium, personalized stainless steel tiffin boxes with laser engraving. Perfect for birthdays, anniversaries, corporate gifting, and everyday use. Worldwide shipping.',
  keywords: [
    'personalized tiffin box', 'customized tiffin', 'engraved stainless steel tiffin',
    'personalized gifts', 'corporate gifting', 'pretty luxe atelier',
    'laser engraved gifts', 'premium tiffin box', 'custom tiffin gift',
    'birthday gift ideas', 'anniversary gifts', 'worldwide gifting',
    'luxury gifting', 'stainless steel bento box'
  ],
  metadataBase: new URL('https://prettyluxeatelier.com'),
  alternates: { 
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'en-GB': '/en-GB',
      'en-IN': '/en-IN',
    },
  },
  category: 'ecommerce',
  creator: 'Pretty Luxe Atelier',
  publisher: 'Pretty Luxe Atelier',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: 'Pretty Luxe',
    statusBarStyle: 'black-translucent',
  },
  appLinks: {
    web: {
      url: 'https://prettyluxeatelier.com',
      should_fallback: true,
    },
  },
  openGraph: {
    title: 'Pretty Luxe Atelier | Premium Personalized Tiffin Boxes & Gifts',
    description: 'Personalized stainless steel tiffin boxes with precision laser engraving. The perfect gift for every occasion. Worldwide shipping.',
    url: 'https://prettyluxeatelier.com',
    siteName: 'Pretty Luxe Atelier',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Pretty Luxe Atelier – Personalized Tiffin Collection' }],
    locale: 'en_US',
    alternateLocale: ['en_GB', 'en_IN', 'en_AU', 'en_CA'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pretty Luxe Atelier | Premium Personalized Tiffin Boxes & Gifts',
    description: 'Personalized stainless steel tiffin boxes with precision laser engraving. Worldwide shipping.',
    images: ['/og-image.jpg'],
    creator: '@prettyluxeatelier',
    site: '@prettyluxeatelier',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: { 
      index: true, 
      follow: true, 
      'max-video-preview': -1, 
      'max-image-preview': 'large', 
      'max-snippet': -1,
      noimageindex: false,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || '',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
  },
  other: {
    'geo.region': 'IN-RJ',
    'geo.placename': 'Udaipur',
    'geo.position': '24.5854;73.7125',
    'ICBM': '24.5854, 73.7125',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://prettyluxeatelier.com/#organization",
    "name": "Pretty Luxe Atelier",
    "url": "https://prettyluxeatelier.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://prettyluxeatelier.com/logo.png",
      "width": 300,
      "height": 100
    },
    "description": "Premium personalized stainless steel tiffin boxes with precision laser engraving. Crafted for gifting and everyday use. Worldwide shipping.",
    "foundingDate": "2023",
    "sameAs": [
      "https://instagram.com/prettyluxeatelier",
      "https://facebook.com/prettyluxeatelier",
      "https://twitter.com/prettyluxeatelier"
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+91-9999988888",
        "email": "hello@prettyluxeatelier.com",
        "contactType": "Customer Service",
        "availableLanguage": ["English"],
        "areaServed": "Worldwide"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Udaipur",
      "addressLocality": "Udaipur",
      "addressRegion": "Rajasthan",
      "postalCode": "313001",
      "addressCountry": "IN"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Personalized Tiffin Collection",
      "itemListElement": [
        "Personalized Tiffin Box",
        "Engraved Gift Set",
        "Corporate Gift Tiffin"
      ]
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://prettyluxeatelier.com/#website",
    "url": "https://prettyluxeatelier.com",
    "name": "Pretty Luxe Atelier",
    "description": "Premium personalized tiffin boxes and engraved gifts. Worldwide shipping.",
    "publisher": { "@id": "https://prettyluxeatelier.com/#organization" },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://prettyluxeatelier.com/shop?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://prettyluxeatelier.com/#localbusiness",
    "name": "Pretty Luxe Atelier",
    "image": "https://prettyluxeatelier.com/logo.png",
    "telephone": "+919999988888",
    "email": "hello@prettyluxeatelier.com",
    "url": "https://prettyluxeatelier.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Udaipur",
      "addressLocality": "Udaipur",
      "addressRegion": "Rajasthan",
      "postalCode": "313001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 24.5854,
      "longitude": 73.7125
    },
    "priceRange": "$$"
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen flex flex-col text-[15px] md:text-base">
        <Providers>
          {children}
        </Providers>
        <Script id="org-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <Script id="website-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <Script id="local-business-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      </body>
    </html>
  );
}
