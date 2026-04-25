import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Shop – Personalized Tiffin Boxes & Engraved Gifts',
  description: 'Browse the full Pretty Luxe Atelier collection. Personalized stainless steel tiffin boxes, engraved gift sets, corporate gifting, and more. Worldwide shipping.',
  keywords: [
    'personalized tiffin box', 'engraved gift', 'customized tiffin',
    'buy tiffin online', 'stainless steel tiffin', 'laser engraved tiffin',
    'birthday gift tiffin', 'anniversary gift', 'corporate gift tiffin'
  ],
  alternates: { canonical: '/shop' },
  openGraph: {
    title: 'Shop Personalized Tiffin Boxes | Pretty Luxe Atelier',
    description: 'Browse premium, laser-engraved stainless steel tiffin boxes. Personalize with names, dates, or logos. Free worldwide shipping.',
    url: 'https://prettyluxeatelier.com/shop',
    type: 'website',
  },
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://prettyluxeatelier.com/shop",
  "name": "Personalized Tiffin Boxes & Engraved Gifts Collection",
  "description": "Browse premium laser-engraved stainless steel tiffin boxes and personalized gifts at Pretty Luxe Atelier.",
  "url": "https://prettyluxeatelier.com/shop",
  "isPartOf": { "@id": "https://prettyluxeatelier.com/#website" },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://prettyluxeatelier.com" },
      { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://prettyluxeatelier.com/shop" }
    ]
  }
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script id="shop-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
    </>
  );
}
