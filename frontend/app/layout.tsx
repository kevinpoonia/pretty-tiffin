import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Script from 'next/script';
import WhatsAppFloating from '@/components/WhatsAppFloating';

export const metadata: Metadata = {
  title: {
    default: 'Pretty Luxe Atelier | Premium Personalized Tiffin Boxes & Gifts',
    template: '%s | Pretty Luxe Atelier'
  },
  description: 'Premium, personalized stainless steel tiffin boxes with laser engraving. Perfect for birthdays, anniversaries, corporate gifting, and everyday use. Worldwide shipping by Pretty Luxe Atelier.',
  keywords: [
    'personalized tiffin box', 'customized tiffin', 'engraved stainless steel tiffin',
    'personalized gifts', 'corporate gifting', 'pretty luxe atelier',
    'luxury lifestyle gift', 'artisan gift hamper', 'bespoke corporate gifts',
    'personalized wedding favors', 'luxury kitchenware gifts', 'custom engraved gifts',
    'premium bento box', 'personalized anniversary gift', 'boutique gift store'
  ],
  metadataBase: new URL('https://prettyluxeatelier.com'),
  alternates: { 
    languages: {
      'en-US': '/en-US',
      'en-GB': '/en-GB',
      'en-AU': '/en-AU',
      'en-NZ': '/en-NZ',
      'en-ZA': '/en-ZA',
      'en-MU': '/en-MU',
      'en-IN': '/en-IN',
      'en-IE': '/en-IE',
      'de-DE': '/de-DE',
      'fr-FR': '/fr-FR',
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
    title: 'Pretty Luxe Atelier',
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
        "telephone": "+27-640-129-242",
        "email": "support@prettyluxeatelier.com",
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
    "founder": {
      "@type": "Person",
      "name": "Admin",
      "jobTitle": "Creative Director",
      "sameAs": [
        "https://www.linkedin.com/company/prettyluxeatelier"
      ]
    },
    "foundingLocation": {
      "@type": "Place",
      "name": "Udaipur, India"
    },
    "knowsAbout": [
      "Personalized Gifting",
      "Corporate Gifting Solutions",
      "Artisanal Stainless Steel Craftsmanship",
      "Luxury Lifestyle Products",
      "Bespoke Wedding Favors"
    ],
    "awards": [
      "Premium Artisanal Brand of the Year Placeholder",
      "Top Gifting Excellence Award Placeholder"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Personalized Tiffin & Gift Collection",
      "@id": "https://prettyluxeatelier.com/#offercatalog",
      "itemListElement": [
        "Personalized Tiffin Box",
        "Engraved Gift Set",
        "Corporate Gift Tiffin",
        "Artisanal Kitchenware"
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
    "speakable": {
      "@type": "SpeakableSpecification",
      "xpath": [
        "/html/head/title",
        "/html/head/meta[@name='description']/@content"
      ]
    },
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
    "telephone": "+27640129242",
    "email": "support@prettyluxeatelier.com",
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen flex flex-col text-[15px] md:text-base">
        <Providers>
          {children}
          <WhatsAppFloating />
        </Providers>
        <Script id="org-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <Script id="website-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <Script id="local-business-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      </body>
    </html>
  );
}
