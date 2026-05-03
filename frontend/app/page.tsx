import { Metadata } from 'next';
import HomeClient from './HomeClient';
import Script from 'next/script';

async function getHomeData() {
  try {
    const [prodRes, bannerRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/products`, { next: { revalidate: 60 } }).then(res => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/banners`, { next: { revalidate: 300 } }).then(res => res.json())
    ]);
    return { products: prodRes || [], banners: bannerRes || [] };
  } catch (e) {
    return { products: [], banners: [] };
  }
}

export const metadata: Metadata = {
  title: 'Pretty Luxe Atelier | Tiffin Boxes, Kitchenware & Ethnic Apparels',
  description: 'Premium stainless steel tiffin boxes, artisanal kitchenware, and ethnic apparels with precision laser engraving. Perfect for everyday use, corporate gifting, and meaningful gifting. Worldwide shipping.',
  alternates: { canonical: 'https://prettyluxeatelier.com' },
  keywords: [
    'tiffin box', 'stainless steel tiffin', 'personalized tiffin box', 'artisanal kitchenware',
    'ethnic apparels', 'ethnic clothing', 'kitchen accessories', 'engraved tiffin gift',
    'corporate gift tiffin', 'bulk tiffin order', 'pretty luxe atelier', 'worldwide shipping',
    'custom kitchen gift', 'traditional ethnic apparels'
  ],
};

export default async function Home() {
  const { products, banners } = await getHomeData();

  const homeFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What types of products does Pretty Luxe Atelier sell?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pretty Luxe Atelier offers premium stainless steel tiffin boxes, artisanal kitchenware essentials, and ethnic apparels. All products can be personalized with laser-engraved names, messages, or company logos — perfect for everyday use, gifting, and corporate orders."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer bulk or corporate orders for kitchenware and tiffins?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! We specialize in bulk and corporate orders for tiffin boxes, kitchen accessories, and branded apparels. Engrave individual names or company logos for a premium branded experience. Pricing discounts available for 20+ units."
        }
      },
      {
        "@type": "Question",
        "name": "What materials are used in Pretty Luxe Atelier products?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our tiffin boxes and kitchenware use food-grade stainless steel (304 series) — rust-proof, BPA-free, and built to last a lifetime. Apparels are crafted from premium natural fabrics. All engravings use precision laser technology for permanent, fade-resistant results."
        }
      },
      {
        "@type": "Question",
        "name": "How long does worldwide shipping take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Standard international delivery takes 7–14 business days. Express shipping is available for 3–7 business days. Shipping charges are calculated at checkout based on your location and order size."
        }
      }
    ]
  };

  return (
    <>
      <HomeClient initialProducts={products} initialBanners={banners} />
      <Script id="home-faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }} />
    </>
  );
}
